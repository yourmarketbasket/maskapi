// contact messages schema
const mongoose = require('mongoose');

const contactMessagesSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false }
});

const ContactMessage = mongoose.model('ContactMessage', contactMessagesSchema);

module.exports = ContactMessage;