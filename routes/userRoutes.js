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

  return router;
};
