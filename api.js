// Import modules
const { BardAPI } = require('bard-api-node');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create an instance of BardAPI
const bard = new BardAPI();

// Create an instance of Express
const app = express();

// Set the port number
const port = process.env.PORT || 3000;

// Define a route handler for GET requests to the root path
app.get('/', async (req, res) => {
  try {
    // Get the input query from the query string
    const input = req.query.input;

    // Check if the input is valid
    if (!input) {
      // Send a bad request response
      res.status(400).send('Missing input query');
      return;
    }

    // Set the session information for authentication
    await bard.setSession('__Secure-1PSID', process.env.BARD_TOKEN);

    // Send the input query to Bard and get the response
    const response = await bard.getBardResponse(input);

    // Send the response content as JSON
    res.json({ content: response.content });
  } catch (error) {
    // Send an internal server error response with the error message
    res.status(500).send(error.message);
  }
});

// Start listening for incoming requests
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
