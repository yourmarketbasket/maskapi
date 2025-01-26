const Message = require('../models/contact-messages');

class MessageService{

    static async sendMessageToContact(sender, receiver, message, io) {
        try {
            const newMessage = new Message({ sender, receiver, message });
            await newMessage.save();
            io.emit('new-message', { sender, receiver, message });
            return { success: true, message: 'Message sent successfully' };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, message: 'Error sending message' };
        }
    }

    // Get all messages between sender and receiver, sorted by timestamp (oldest first)
    static async getAllMessagesFromContact(sender, receiver) {
        try {
            const messages = await Message.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender }
                ]
            })
            .sort({ timestamp: 1 }); // 1 for ascending order (oldest first)

            return { success: true, messages };
        } catch (error) {
            console.error('Error getting messages:', error);
            return { success: false, message: 'Error getting messages' };
        }
    }



}

module.exports = MessageService