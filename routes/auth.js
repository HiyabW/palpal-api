const express = require('express');
const router = express.Router();
const createError = require('http-errors')
const User = require('../models/userModels')
const { authSchema } = require('../helpers/validationSchema')
const { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../helpers/jwtHelper')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { status: 429, message: 'Too many attempts, please try again in 15 minutes.' } }
})

router.post('/', async (req, res, next) => {
    console.log("here")
    res.send("auth landing route")
})

router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const doesExist = await User.findOne({ email: req.body.email })
        if (doesExist) throw createError.Conflict(`${req.body.email} is already registered`)

        const user = new User(req.body)
        const id = user?._id
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')

        res.send({ accessToken, id })
    } catch (error) {
        next(error)
    }
})

router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) throw createError.NotFound('User Not Registered')
        const isMatch = await user.isValidPassword(req.body.password)
        if (!isMatch) throw createError.Unauthorized('Username/password not valid')

        /* we will also send gender to see if they've completed the survey
        if they have gender, they finished survey and should route to feed
        otherwise, route to survey */
        const gender = user?.gender
        const id = user?._id

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ accessToken, gender, id })
    } catch (err) {
        next(err)
    }
})

router.post('/survey', verifyAccessToken, async (req, res, next) => {
    try {
        const {
            name,
            phone,
            age,
            gender,
            genderPreferences,
            agePreferences,
            budget,
            city,
            cleanlinessPreferences,
            guestPreferences,
            leaseType,
            petPreferences,
            smokerPreferences,
            bio,
            expectedMoveOut,
            hobbies,
        } = req.body

        const allowedFields = {
            name,
            phone,
            age,
            gender,
            genderPreferences,
            agePreferences,
            budget,
            city,
            cleanlinessPreferences,
            guestPreferences,
            leaseType,
            petPreferences,
            smokerPreferences,
            bio,
            expectedMoveOut,
            hobbies,
        }

        const updated = await User.updateOne(
            { _id: req.user._id },
            { $set: allowedFields }
        )

        res.setHeader("Access-Control-Allow-Origin", '*')
        res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
        res.send({ updated })
    } catch (err) {
        next(err)
    }
})

router.post('/refreshToken', async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken
        if (!refreshToken) throw createError.Unauthorized('No refresh token')
        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const newRefreshToken = await signRefreshToken(userId)

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.send({ accessToken })
    } catch (error) {
        next(error)
    }
})

router.delete('/logout', async (req, res, next) => {
    try {
        // const refreshToken = req.body
        // if (!refreshToken) throw createError.BadRequest()
        // const userId = await verifyRefreshToken(refreshToken)


    } catch (err) {
        next(err)
    }
    res.send("logout route")
})

// router.post('/onboarded', async (req, res, next) => {
//     try {
//         const updated = await User.updateOne({ _id: req.body._id }, { $set: {isOnboarded: true} })
//         res.setHeader("Access-Control-Allow-Origin", '*')
//         res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
//         res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
//         res.send({ updated })
//     } catch (err) {
//         next(error)
//     }
// })

module.exports = router;