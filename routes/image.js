const express = require('express');
const router = express.Router();
var Image = require('../models/imageModels');
var User = require('../models/userModels')
const { ObjectId } = require('mongodb')


router.post('/addImages', async (req, res, next) => {
    try {
        for (let i = 0; i < req.body.images.length; ++i) {
            const image = new Image({owner:req.body.owner, image: req.body.images[i]})
            await image.save()
        }

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ success: true })

    } catch (e) {
        console.log(e)
        next(e)
    }
});

router.post('/deleteImages', async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        const deletedImagesResult = await Image.deleteMany({ owner: user._id })
        console.log(deletedImagesResult)

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ success: true })

    } catch (e) {
        console.log(e)
        next(e)
    }
});

module.exports = router;