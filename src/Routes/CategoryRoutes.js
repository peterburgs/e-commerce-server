// Import model
const Category = require("../models/Category");

// Import libraries
const express = require("express");

const router = express.Router();

// GET method: get all categories
router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();
    // If Error
    if (!categoryList) {
      res.status(500).json({
        message: "*** Cannot get categories",
      });
    }
    // If found categories
    res.status(200).json({
      message: "Successfully",
      categories: categoryList,
    });
  } catch (error) {
    console.log("*** Cannot GET categories");
    res.status(500).json({
      message: "*** Cannot get categories",
    });
  }
});

// POST method: create a new category
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  try {
    const savedCategory = await category.save();
    // If error
    if (!savedCategory) {
      res.status(500).json({
        message: "Cannot create new category",
      });
    }
    // If success
    res.status(201).json({
      message: "New category is created successfully",
      category: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot create new category",
      error: error.message,
    });
  }
});

// Export module
module.exports = router;
