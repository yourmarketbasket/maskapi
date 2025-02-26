const Message = require('../models/contact-messages');

class MessageService{

    static async sendMessageToContact(sender, receiver, message, io) {
        try {
            const newMessage = new Message({ sender, receiver, message, timestamp: new Date() });
            await newMessage.save();
            io.emit('new-message', { sender, receiver, message, timestamp:newMessage.timestamp });
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
    // get all usernames where username is either sender or receiver, should pass username, method is getChatMates
    static async getChatMates(username) {
        try {
            // search in messages where the username is either sender or receiver
            const messages = await Message.find({
                $or: [
                    { sender: username },
                    { receiver: username }
                ]
            }).sort({ timestamp: -1 }); // Sort messages by timestamp to get the most recent ones first
            
            const chatMates = new Map(); // Use Map to track the last message for each chat mate
    
            messages.forEach(message => {
                const chatMate = message.sender === username ? message.receiver : message.sender;
                // If chat mate already exists, don't overwrite the last message
                if (!chatMates.has(chatMate)) {
                    chatMates.set(chatMate, message);
                }
            });
    
            // Prepare result
            const result = Array.from(chatMates, ([chatMate, lastMessage]) => ({
                chatMate,
                lastMessage
            }));
    
            return { success: true, chatMates: result };
        } catch (error) {
            console.error('Error getting chat mates:', error);
            return { success: false, message: 'Error getting chat mates' };
        }
    }
    
            
    




}

module.exports = MessageService