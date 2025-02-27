const express = require('express');
const UserServices = require('../services/userServices'); // Import the class
const router = express.Router();

module.exports = (io) => {
  // Define routes
  router.get('/checkIfUsernameExists/:username', async (req, res) => {
    try {
      const { username } = req.params;

      // Call the static method directly without instantiating the class
      const result = await UserServices.checkUsernameExists(username);

      // Send appropriate status and response
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /checkIfUsernameExists route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });

//   get all users
  router.get('/getAllUsers', async (req, res) => {
    try {
      const result = await UserServices.getAllUsers();
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /getAllUsers route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });
//   get my contacts
  router.get('/getMyContacts/:username', async (req, res) => {
    try {
      const result = await UserServices.getMyContacts(req.params.username);
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /getMyContacts route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });

//   add contact route
  router.post('/addContactRoute', async (req, res) => {
    try {
      const result = await UserServices.addContact(req.body.username, req.body.contact, io);
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /addContact route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });

  // toggle online status
  router.post('/toggleOnlineStatusRoute', async (req, res) => {
    try {
      const result = await UserServices.toggleOnlineStatus(req.body.username, req.body.status, io);
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /toggleOnlineStatus route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });
  // check online status of contact post request
  router.post('/checkOnlineStatusRoute', async (req, res) => {
    try {
      const result = await UserServices.checkOnlineStatus(req.body.username);
      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result); // Use 400 for client-side issues like invalid requests
      }
    } catch (error) {
      console.error('Error in /checkOnlineStatus route:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });
  // send firebase notification
  

  return router;
};
