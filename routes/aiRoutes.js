const express = require('express');
const AIService = require('../services/aiService');
const router = express.Router();


module.exports = (io)=>{
    // Define your routes
    router.post('/moderateChatMessageRoute', async(req, res) => {
        res.send(await AIService.moderateChatMessage(req.body.message));
    });    



// testing agaidsfdf



    


    return router;

}





