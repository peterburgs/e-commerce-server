// Import Models
require("./Models/Product");
require("./Models/Category");
require("./Models/User");

// Import libraries
require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./Helpers/jwt");

// Import middleware
const errorHandler = require("./Helpers/errorHandler");

// Import Routes
const ProductRoutes = require("./Routes/ProductRoutes");
const CategoryRoutes = require("./Routes/CategoryRoutes");
const UserRoutes = require("./Routes/UserRoutes");

// Define app
const port = 3001;
const app = express();

// Prevent CORS errors
app.use(cors());
app.options("*", cors());

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "e-commerce",
  })
  .then(() => console.log("*** MongoDB Connection is ready"))
  .catch((err) => console.log("*** Error: " + err.message));

// Get API URL from environment
const api = process.env.API_URL;

// Middleware
app.use(bodyParser.json());
app.use(
  morgan("Method=:method |URL= :url |Status= :status | :response-time ms")
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authJwt());
app.use(errorHandler);

// Define URL
app.use(`${api}/products`, ProductRoutes);
app.use(`${api}/categories`, CategoryRoutes);
app.use(`${api}/users`, UserRoutes);

// Start app with given port
app.listen(port, async (req, res) => {
  console.log("*** Server is running in port " + port);
});
