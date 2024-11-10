const express = require('express')
const router = express.Router()
const Chat = require('../models/chatModels')
const User = require('../models/userModels')
const Match = require('../models/matchModels')
const Image = require('../models/imageModels')
const { ObjectId } = require('mongodb')
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function getCommonElements(list1, list2) {
    let commonElements = []
    for (let i = 0; i < list1.length; ++i) {
        for (let j = 0; j < list2.length; ++j) {
            if (list1[i].equals(list2[j]) && !commonElements.includes(list1[i])) {
                commonElements.push(list1[i])
            }
        }
    }
    // Add AI Bot so it'll always be there to chat with!
    commonElements.push('6730784af24ec4375cf95a17')
    return commonElements
}

router.post('/getChats', async (req, res, next) => {
    try {
        // fetch all people that current user has matched with (query match table)
        const currUserId = ObjectId.createFromHexString(req.body.id)

        const yourMatches = await Match.find({ isAMatch: true, from: currUserId }, { to: 1 })
        let yourMatchesSimplified = []
        for (let i = 0; i < yourMatches.length; ++i) {
            yourMatchesSimplified.push(yourMatches[i].to)
        }

        const matchedWithYou = await Match.find({ isAMatch: true, to: currUserId }, { from: 1 })
        let matchedWithYouSimplified = []
        for (let i = 0; i < matchedWithYou.length; ++i) {
            matchedWithYouSimplified.push(matchedWithYou[i].from)
        }

        // Array of all the people you've matched with that matched you back
        const mutualMatches = await getCommonElements(yourMatchesSimplified, matchedWithYouSimplified);

        console.log(yourMatchesSimplified, matchedWithYouSimplified)

        let Messages = {}
        for (let i = 0; i < mutualMatches.length; ++i) {
            // find all messages between currUser and user, regardless of who specificlaly is the sender/recipient
            const id = mutualMatches[i]
            const TotalMessages = await Chat.find({ $or: [{ from: currUserId, to: id }, { to: currUserId, from: id }] })
            const SortedMessages = TotalMessages.length > 0 ? TotalMessages.sort((a, b) => b.date - a.date) : [];
            const user = await User.findOne({ _id: mutualMatches[i] })
            const name = user.name
            const userImageArray = await Image.find({ owner: mutualMatches[i] })
            const Pfp = userImageArray[0].image

            Messages[mutualMatches[i]] = { name, id, Pfp, SortedMessages }
        }

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ Messages })
    } catch (error) {
        next(error)
    }
})

router.post('/sendMessage', async (req, res, next) => {
    try {
        const chat = new Chat(req.body)
        const savedChat = await chat.save()

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send(savedChat)
    } catch (e) {
        next(e)
    }
})

router.post('/chatAI', async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    try {
        const prompt = req.body.message;

        try {
            // Get response from AI
            const genAI = new GoogleGenerativeAI(process.env.API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const message = result?.response?.candidates[0]?.content?.parts[0]?.text

            // Then save as a chat message
            const chat = new Chat({from: new ObjectId('6730784af24ec4375cf95a17'), to: req.body.from, message:message, date: Date.now()})
            const savedChat = await chat.save()

            res.send({ message, savedChat })

        } catch (e) {
            next(e)
        }
    } catch (e) {
        next(e)
    }
})

module.exports = router;