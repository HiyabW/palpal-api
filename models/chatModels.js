const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./userModels')


const ChatSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    date: {
        type: Date
    }
})

const Chat = mongoose.model('chat', ChatSchema)
module.exports = Chat