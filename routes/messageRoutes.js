const express = require('express');
const MessageService = require('../services/messageService');
const router = express.Router();


module.exports = (io)=>{
    // send message
    router.post('/sendMessageToContactRoute', async(req, res) => {
        res.send(await MessageService.sendMessageToContact(req.body.sender, req.body.receiver, req.body.message, io));
    });

    // get all messages between sender and receiver
    router.post('/getAllMessagesFromContactRoute', async(req, res) => {
        res.send(await MessageService.getAllMessagesFromContact(req.body.sender, req.body.receiver));
    });
    

    


    return router;

}
