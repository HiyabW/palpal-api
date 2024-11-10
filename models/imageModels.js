const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./userModels')

const ImageSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        lowercase: true,
    },
    image: {
        type: String,
        required: true
    }
})

const Image = mongoose.model('image', ImageSchema)
module.exports = Image