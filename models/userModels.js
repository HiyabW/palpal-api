const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone:  {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    age: {
        type: Date,
        required: false
    },
    agePreferences: {
        type: Array,
        required: false
    },
    budget: {
        type: Array,
        required: false
    },
    city: {
        type: Array,
        required: false
    },
    cleanlinessPreferences: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    genderPreferences: {
        type: Array,
        required: false
    },
    guestPreferences: {
        type: String,
        required: false
    },
    leaseType: {
        type: Array,
        required: false
    },
    petPreferences: {
        type: String,
        required: false
    },
    smokerPreferences: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    smokerPreferences: {
        type: String,
        required: false
    },
    expectedMoveOut: {
        type: Date,
        required: false
    },
    hobbies: {
        type: Array,
        required: false
    },
    // isOnboarded: {
    //     type: Boolean,
    //     default: false
    // },
})

UserSchema.pre('save', async function (next) {
    let unhashedPassword = this.password
    try {
        let hashPassword = new Promise((resolve, reject) => {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(unhashedPassword, salt, null, function (err, hash) {
                    if (err) {
                        console.log("Error hashing password")
                        next(error);
                    }
                    resolve(hash)
                })
            })
        })
        hashPassword
            .then((hash) => {
                this.password = hash
                next()
            })
    } catch (error) {
        console.log(error)
        next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password) {
    let currPassword = this.password
    return new Promise(function (resolve, reject) {
        try {
            bcrypt.compare(password, currPassword, async function (err, result) {
                if (err) {
                    console.log("Error during bcrypt comparison: ", err)
                }
                resolve(result)
            })
        } catch (err) {
            throw (error)
        }
    })
}

const User = mongoose.model('user', UserSchema)
module.exports = User