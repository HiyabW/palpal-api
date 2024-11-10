const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/initMongoDb')
const { verifyAccessToken } = require('./helpers/jwtHelper')
const cors = require('cors')

const authRoute = require('./routes/auth')
const feedRoute = require('./routes/feed')
const imageRoute = require('./routes/image')
const matchRoute = require('./routes/match')
const chatRoute = require('./routes/chat')

const app = express()
app.use(morgan('dev'))
const corsOptions = {
    origin: true,
    credentials: true
}
app.options('*', cors(corsOptions))
app.use(express.json({ limit: "50mb", }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send("hello frm express")
})


app.use('/auth', authRoute)
app.use('/feed', feedRoute)
app.use('/match', matchRoute)
app.use('/chat', chatRoute)
app.use('/images', imageRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound('This route does not exist'))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3007

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})