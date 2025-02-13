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


    router.post('/generateRegistrationOptionsRoute', async (req, res) => {
        try {
              

            const options = await userServices.generateRegistrationChallenge(req.body);
            res.json({ success: true, data: options });

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    router.post('/verifyAttestationRoute', async (req, res) => {
        try {
              

            const verification = await userServices.verifyWebAuthnAttestation(req.body);
            res.json({ success: true, data: verification });

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    })

    router.post('/saveCredentials', async (req, res) => {
        try {
              

            const options = await userServices.saveCredentials(req.body);
            res.json({ success: true, data: options });

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });





    


    return router;

}



