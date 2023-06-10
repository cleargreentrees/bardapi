// Import modules
const { BardAPI } = require('bard-api-node');
const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit'); // Import the express-rate-limit module

// Load environment variables
dotenv.config();

// Create an instance of BardAPI
const bard = new BardAPI();

// Create an instance of Express
const app = express();

// Set the port number
const port = process.env.PORT || 3000;

// Define a rate limit middleware
const limiter = rateLimit({
  windowMs: 3 * 1000, // 3 seconds
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    // Send a too many requests response
    res.status(429).send('Too many requests, please try again later');
  },
});

// Apply the rate limit middleware to all routes
app.use(limiter);

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
    await bard.setSession('__Secure-1PSID', process.env.BARDTOKEN);

    // Set a timeout for the request
    const timeout = setTimeout(() => {
      // Abort the request and send a timeout response
      bard.abort();
      res.status(408).send('Request timed out');
    }, 10 * 1000); // 10 seconds

    // Send the input query to Bard and get the response
    const response = await bard.getBardResponse(input);

    // Clear the timeout
    clearTimeout(timeout);

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
