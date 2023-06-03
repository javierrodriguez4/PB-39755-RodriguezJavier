const mongoose = require('mongoose');

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    phone:{
        type: String,
        unique: true,
    },
    age:{
        type: String
    },
    role: {
        type: String
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model(userCollection, userSchema);

