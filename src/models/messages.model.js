require('dotenv').config();

const mongoose = require('mongoose');

const messagesCollection = 'messages';

const messagesSchema = new mongoose.Schema({
    user: {
        type: String,
        index: true
    },
    message: [{
        type: String
    }]
});

module.exports = mongoose.model(messagesCollection, messagesSchema);
