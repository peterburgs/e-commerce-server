// Import libraries
require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

// Define app
const port = 3001;
const app = express();

// Get API URL from environment
const api = process.env.API_URL;

// Middleware
app.use(bodyParser.json());
app.use(
  morgan(
    "Method=:method |URL=:url |Status=:status |:response-time ms"
  )
);
app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: "pepsi",
    image: "google.com",
  };
  res.status(200).json({
    message: "Done",
    product,
  });
});

// Start app with given port
app.listen(port, async (req, res) => {
  console.log(api);
  console.log("Server is running in port " + port);
});
