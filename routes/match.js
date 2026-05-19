const express = require('express')
const router = express.Router()
const Match = require('../models/matchModels')
const { ObjectId } = require('mongodb')
const asyncHandler = require('../helpers/asyncHandler')

router.post('/saveMatch', asyncHandler(async (req, res, next) => {
    const match = new Match({ ...req.body, from: req.user._id })
    const savedMatch = await match.save()

    res.send({ savedMatch })
}))

router.post('/getMatch', asyncHandler(async (req, res, next) => {
    const from = ObjectId.createFromHexString(req.user._id)
    const to = ObjectId.createFromHexString(req.body.to)

    console.log({ from, to, isAMatch: true })
    const match = await Match.findOne({ from, to, isAMatch: true })
    res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    if (match) {
        res.send({ isAMatch: true })
    }
    else {
        res.send({ isAMatch: false })
    }
}))

router.post('/unmatch', asyncHandler(async (req, res, next) => {
    const from = ObjectId.createFromHexString(req.user._id)
    const to = ObjectId.createFromHexString(req.body.to)
    res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')

    console.log({ from, to, isAMatch: true })
    const match = await Match.updateOne({ from, to}, {$set:{isAMatch: false} })
    if (match) {
        res.send({ isAMatch: false })
    }
    else {
        res.send({ isAMatch: false })
    }
}))

module.exports = router;
