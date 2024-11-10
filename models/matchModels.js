const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./userModels')


const MatchSchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    isAMatch: {
        type: Boolean,
        required: true
    }
})

const Match = mongoose.model('match', MatchSchema)
module.exports = Match