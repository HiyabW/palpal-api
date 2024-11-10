const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                issuer: "localhost:3000",
                audience: userId
            }
            /* ^Change iss to padpal.com or whatever we decide to change to when deploying */
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                // if (err.name === 'JsonWebTokenError') {
                //     return next(createError.Unauthorized())
                // } else {
                //     return next(createError.Unauthorized(err.message))
                // }
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            console.log(refreshToken)
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) {
                    console.log('error creating refresh token: ', err)
                    return reject(createError.Unauthorized)
                }
                const userId = payload.aud
                resolve(userId)
            })
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                issuer: "localhost:3000",
                audience: userId
            }
            /* ^Change iss to padpal.com or whatever we decide to change to when deploying */
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
}