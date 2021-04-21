// Import libraries
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Import models
const User = require("../needToChange/User");

const router = express.Router();

// POST method: create new user
router.post("/", async (req, res) => {
  const rawPassword = req.body.rawPassword;
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(rawPassword, 10),
    phoneNumber: req.body.phoneNumber,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });
  try {
    const savedUser = await user.save();
    if (!savedUser) {
      res.status(500).json({
        message: "Cannot create new user",
      });
    } else {
      res.status(201).json({
        message: "Create new user successfully",
        user: savedUser,
      });
    }
  } catch (error) {
    console.log("*** Error when create new user: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get one user
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (mongoose.isValidObjectId(id)) {
    try {
      const user = await User.find({ _id: id, hidden: false });
      if (user) {
        res.status(200).json({
          message: "User found",
          user,
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Cannot find user",
      });
    }
  } else {
    next();
  }
});

// GET method: get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ hidden: false });
    if (users) {
      res.status(200).json({
        message: "Users found",
        count: users.length,
        users,
      });
    } else {
      message: "Cannot find any user";
    }
  } catch (error) {
    console.log("Error when get all users: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// PUT method: update one user
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    if (user) {
      res.status(200).json({
        message: "User updated",
        user,
      });
    } else {
      res.status(500).json({
        message: "Cannot update user",
      });
    }
  } catch (error) {
    console.log("Error when update user");
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE method: remove/hide a user
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { hidden: true },
      { new: true }
    );
    if (user) {
      res.status(200).json({
        message: "User has been hidden",
        user,
      });
    } else {
      res.status(500).json({
        message: "Cannot hide user",
      });
    }
  } catch (error) {
    console.log("Error when delete user: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// POST method: log user in
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Validate user email existed or not
    if (user) {
      // validate raw password with hashed password
      if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
        const token = jwt.sign(
          {
            userId: user.id,
            isAdmin: user.isAdmin,
          },
          process.env.SECRET_KEY,
          { expiresIn: "8h" }
        );
        res.status(200).json({
          message: "Authenticated successfully",
          token,
          user,
        });
      } else {
        res.status(401).json({
          message: "password mismatch",
        });
      }
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log("Error when log user in: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// POST method: sign user up
router.post("/signup", async (req, res) => {
  const rawPassword = req.body.rawPassword;
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(rawPassword, 10),
    phoneNumber: req.body.phoneNumber,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });
  try {
    const savedUser = await user.save();
    if (!savedUser) {
      res.status(500).json({
        message: "Sign up fail",
      });
    } else {
      res.status(201).json({
        message: "Sign up successfully",
        user: savedUser,
      });
    }
  } catch (error) {
    console.log("*** Error when sign up: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// Export router
module.exports = router;
