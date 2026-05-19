const express = require('express');
const router = express.Router();
var Image = require('../models/imageModels');
var User = require('../models/userModels')
const { ObjectId } = require('mongodb')
const asyncHandler = require('../helpers/asyncHandler')


router.post('/addImages', asyncHandler(async (req, res, next) => {
    for (let i = 0; i < req.body.images.length; ++i) {
        const image = new Image({owner: req.user._id, image: req.body.images[i]})
        await image.save()
    }

    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    res.send({ success: true })
}));

router.post('/deleteImages', asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ _id: req.user._id })
    const deletedImagesResult = await Image.deleteMany({ owner: user._id })
    console.log(deletedImagesResult)

    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    res.send({ success: true })
}));

module.exports = router;
