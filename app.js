const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/initMongoDb')
const { verifyAccessToken } = require('./helpers/jwtHelper')
const cors = require('cors')
const cookieParser = require('cookie-parser')


const authRoute = require('./routes/auth')
const feedRoute = require('./routes/feed')
const imageRoute = require('./routes/image')
const matchRoute = require('./routes/match')
const chatRoute = require('./routes/chat')

const app = express()
app.use(morgan('dev'))
app.use(express.static('dist'));
const corsOptions = {
    origin: true,
    credentials: true
}
app.options('*', cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.get('/', (req, res, next) => {
    res.send("hello frm express")
})


app.use('/auth', authRoute)
app.use('/feed', verifyAccessToken, feedRoute)
app.use('/match', verifyAccessToken, matchRoute)
app.use('/chat', verifyAccessToken, chatRoute)
app.use('/images', verifyAccessToken, imageRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound('This route does not exist'))
})

app.use((err, req, res, next) => {
    const status = err.status || 500
    console.error(JSON.stringify({
        message: err.message,
        stack: err.stack,
        status,
        path: req.path,
        method: req.method,
    }))
    res.setHeader("Access-Control-Allow-Origin", '*')
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST')
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Authorization,timeout')
    const message = status >= 500 ? 'Internal server error' : err.message
    res.status(status)
    res.send({
        error: {
            status,
            message,
        }
    })
})

const PORT = process.env.PORT || 3007

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

// module.exports.handler = serverless(app);