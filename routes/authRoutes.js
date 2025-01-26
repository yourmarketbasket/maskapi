const express = require('express');
const userServices = require('../services/userServices');
const {checkDBConnection, closeDBConnection} = require('../middleware/db');
const AuthService = require('../services/authServices');
const router = express.Router();


module.exports = (io)=>{
    // Define your routes
    router.post('/loginUserRoute', async(req, res) => {
        res.send(await AuthService.loginUser(req.body.username));
    });

    router.post('/registerUserRoute', async(req, res) => {
        res.send(await userServices.registerUser(req.body.username));
    });

    


    return router;

}



