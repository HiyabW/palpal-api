const express = require('express');
const router = express.Router();
const createError = require('http-errors')
const User = require('../models/userModels')
const Image = require('../models/imageModels');
const Match = require('../models/matchModels');
const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');

router.post('/getUser', async (req, res, next) => {
    const user = await User.findOne({ _id: req.body.id })
    let images = {}
    const currUserImages = await Image.find({ owner: user._id })
    images = [...currUserImages]

    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    res.send({ user, images })
})

router.post('/', async (req, res, next) => {

    /**** Util funcitons and variables *****/
    const pluralToSingularGender = {
        Women: "Woman",
        Men: "Man",
        "Non binary": "Non binary"
    }

    function getAge(today, birthdayStr) {
        let birthday = new Date(birthdayStr);
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();

        // If the birthday hasn't happened this year yet, subtract 1
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        return age
    }

    function isInSameMonth(date1, date2) {
        const dateObj1 = new Date(date1)
        const dateObj2 = new Date(date2)

        if (dateObj1.getMonth() === dateObj2.getMonth()) {
            return true
        }
        return false
    }

    function hasOverlap(arr1, arr2) {
        return arr1.some(item => arr2.includes(item));
    }
    /****************************************/

    try {
        const currUser = await User.findOne({ _id: req.body.id })

        const currUserBudgetMax = currUser.budget[0].max
        const currUserExpectedMoveOut = currUser.expectedMoveOut[0]
        let genderPreferences = currUser.genderPreferences
        for (let i = 0; i < genderPreferences.length; ++i) {
            genderPreferences[i] = pluralToSingularGender[genderPreferences[i]]
        }

        let cityPreferences = currUser.city

        /* NON NEGOTIABLES: GENDER AND CITY */
        const users = await User.find({ gender: { $in: genderPreferences }, city: { $in: cityPreferences }, _id: { $ne: new ObjectId('6730784af24ec4375cf95a17') }, email: { $ne: currUser.email }, expectedMoveOut: { $gt: new Date().toISOString() } })
        console.log({ gender: { in: genderPreferences }, city: { in: cityPreferences }, email: { ne: currUser.email }, expectedMoveOut: { gt: new Date().toISOString() } })
        let compatibleUsers = {}
        let sortedCompatibleUsers = {}
        let scoring = []
        let images = {}
        const today = new Date();

        for (let i = 0; i < users.length; ++i) {
            const user = users[i]

            // Before even checking anything, make sure currUser hasnt already denied user in Match table
            const alreadyDenied = await Match.find({ from: currUser._id, to: user._id })

            if (alreadyDenied.length === 0) {
                /* First get all of that user's images */
                const currUserImages = await Image.find({ owner: user._id })
                images[user.email] = [...currUserImages]

                let score = 0
                const userAge = getAge(today, user['age'])
                const userExpectedMoveOut = user.expectedMoveOut[0]
                const userBudgetMin = user.budget[0].min
                const userBudgetMax = user.budget[0].max

                /**** AGE, BUDGET, MOVE OUT DATE, AND LEASE TYPE ARE WORTH FIVE POINTS ****/
                if (userAge >= currUser.agePreferences[0].min && userAge <= currUser.agePreferences[0].max) {
                    score += 5
                }
                if (Math.abs(currUserBudgetMax - userBudgetMax) <= 200) {
                    // if maxbudget difference is about 200 or less, we consider that a good match
                    score += 5
                }
                if (isInSameMonth(currUserExpectedMoveOut, userExpectedMoveOut)) {
                    // if expected move out is the same month, we consider that a good match
                    score += 5
                }
                if (hasOverlap(currUser.leaseType, user.leaseType)) {
                    // if users share at least one common lease preference, we consider it a good match
                    score += 5
                }


                /**** CLEANLINESS, SMOKER, PET AND GUESTS ARE WORTH THREE POINTS ****/
                if (currUser.cleanlinessPreferences === user.cleanlinessPreferences) {
                    score += 3
                }
                if (currUser.guestPreferences === user.guestPreferences) {
                    score += 3
                }
                if (currUser.petPreferences === user.petPreferences) {
                    score += 3
                }
                if (currUser.smokerPreferences === user.smokerPreferences) {
                    score += 3
                }

                /**** HOBBIES ARE WORTH ONE POINT ****/
                for (let i = 0; i < currUser.hobbies.length; ++i) {
                    for (let j = 0; j < user.hobbies.length; ++j) {
                        if (user.hobbies[j] === currUser.hobbies[i]) {
                            score += 1
                        }
                    }
                }

                compatibleUsers[`${user.email}`] = user
                scoring.push([`${user.email}`, score])
            }
        }

        /**** Now that we've collected all users and scores, sort compatible users ****/
        scoring.sort(function (a, b) {
            return b[1] - a[1];
        });
        for (let i = 0; i < scoring.length; ++i) {
            sortedCompatibleUsers[scoring[i][0]] = compatibleUsers[scoring[i][0]]
        }

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ "compatibleUsers": sortedCompatibleUsers, scoring, images })
    } catch (error) {
        next(error)
    }
})

module.exports = router;