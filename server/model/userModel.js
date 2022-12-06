const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: 'Name is Required',
    },

    email: {

        type: String,
        trim: true,
        unique: 'Email already Exist',
        match: [/.+\@.+\..+/, 'Please type a valid email address'],
        required: 'Name is Required',

    },
    password: {
        type: String,
        required: 'Password is required'
    },



}, { timestamps: true })


module.exports = mongoose.model('User', UserSchema)