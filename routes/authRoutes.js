const express = require('express');
const userServices = require('../services/userServices');
const {checkDBConnection, closeDBConnection} = require('../middleware/db');
const router = express.Router();


module.exports = (io)=>{
    // Define your routes
    router.post('/login', (req, res) => {
        res.send('Login route');
    });

    router.post('/registerUserRoute', async(req, res) => {
        res.send(await userServices.registerUser(req.body.username));
    });

    


    return router;

}



