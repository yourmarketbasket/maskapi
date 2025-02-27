const express = require('express');
const MessageService = require('../services/messageService');
const UserService = require('../services/userServices');
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
    // get chatmates
    router.post('/getChatMatesRoute', async(req, res) => {
        res.send(await MessageService.getChatMates(req.body.username));
    });
    // send firebase notification route
    router.post('/sendFirebaseNotificationRoute', async(req, res)=>{
        res.send(await UserService.sendFirebaseNotification(req.body))
    })

    

    


    return router;

}
