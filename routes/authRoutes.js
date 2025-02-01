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


    router.post('/generateRegistrationChallengeRoute', async (req, res) => {
        try {
              

            const options = await userServices.generateRegistrationChallenge(req.body);
            res.json({ success: true, data: options });

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });



    


    return router;

}



