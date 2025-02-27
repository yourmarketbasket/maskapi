const express = require('express');
const userServices = require('../services/userServices');
const {checkDBConnection, closeDBConnection} = require('../middleware/db');
const AuthService = require('../services/authServices');
const router = express.Router();


module.exports = (io)=>{
    // Define your routes
    router.post('/getUserByUsernameRoute', async(req, res) => {
        res.send(await userServices.getUserByUsername(req.body.username));
    });

    // register user
    router.post('/registerUserRoute', async(req, res) => {
        res.send(await userServices.registerUser(req.body));
    });

    // validate backup codes
    router.post('/validateBackupCodesRoute', async(req, res) => {
        res.send(await userServices.validateBackupCodes(req.body));
    });
    // update user details with public key and device details
    router.post('/updateUserDetailsRoute', async(req, res) => {
        res.send(await userServices.updateUserDetails(req.body));
    });
    // update firebase token
    router.post('/updateFirebaseNotificationTokenRoute', async(req, res)=>{       
        res.send(await userServices.updateFirebaseNotificationToken(req.body)); 

    })
    


    

    

    




    


    return router;

}



