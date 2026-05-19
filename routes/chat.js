const express = require('express')
const router = express.Router()
const Chat = require('../models/chatModels')
const User = require('../models/userModels')
const Match = require('../models/matchModels')
const Image = require('../models/imageModels')
const { ObjectId } = require('mongodb')
const asyncHandler = require('../helpers/asyncHandler')

async function getCommonElements(list1, list2) {
    let commonElements = []
    for (let i = 0; i < list1.length; ++i) {
        for (let j = 0; j < list2.length; ++j) {
            if (list1[i].equals(list2[j]) && !commonElements.includes(list1[i])) {
                commonElements.push(list1[i])
            }
        }
    }
    return commonElements
}

router.post('/getChats', asyncHandler(async (req, res, next) => {
    // fetch all people that current user has matched with (query match table)
    const currUserId = ObjectId.createFromHexString(req.user._id)

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
}))

router.post('/sendMessage', asyncHandler(async (req, res, next) => {
    const chat = new Chat({ ...req.body, from: req.user._id })
    const savedChat = await chat.save()

    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    res.send(savedChat)
}))

module.exports = router;
