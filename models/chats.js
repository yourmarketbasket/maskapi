// chats model
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: { type:String, required: true },
    receiver: { type: String, required: true  },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
    isGroupChat: { type: Boolean, default: false, required: true },
    groupName: { type: String, required: false },
    groupId: { type: String, required: false },

    
  });
  
  const Chat = mongoose.model('Chat', chatSchema);
  
  module.exports = Chat;