// Import model
const Category = require("../Models/Category");

// Import libraries
const express = require("express");

const router = express.Router();

// GET method: get all categories
router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find({ hidden: false });
    // If Error
    if (!categoryList) {
      res.status(500).json({
        message: "*** Cannot get categories",
      });
    }
    // If found categories
    res.status(200).json({
      message: "Successfully",
      count: categoryList.length,
      categories: categoryList,
    });
  } catch (error) {
    console.log("*** Cannot GET categories");
    res.status(500).json({
      message: "*** Cannot get categories",
    });
  }
});

// GET method: get one category
router.get("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const category = await Category.findOne({ hidden: false, _id });
    // If cannot find category
    if (!category) {
      res.status(404).json({
        message: "Category not found",
      });
    }
    // If found
    else {
      res.status(200).json({
        message: "Category found",
        category,
      });
    }
  } catch (error) {
    console.log("*** Error when get category: ", error.message);
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

// DELETE method: hide a category by ID
router.delete("/:categoryId", async (req, res) => {
  try {
    const hiddenCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { hidden: true }
    );

    // If cannot update
    if (!hiddenCategory) {
      res.status(500).json({
        message: "Cannot delete category",
      });
    }
    // If category can be updated
    else {
      res.status(200).json({
        message: "Category is hidden",
        hiddenCategory,
      });
    }
  } catch (error) {
    console.log("*** Error when delete category: ", error.message);
  }
});

// PUT method: update a category
router.put("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      {
        $set: req.body,
      },
      { new: true }
    );
    // If cannot update
    if (!updatedCategory) {
      res.status(500).json({
        message: "Cannot update category",
      });
    }
    // If update successfully
    else {
      res.status(200).json({
        message: "Updated successfully",
        category: updatedCategory,
      });
    }
  } catch (error) {
    console.log("*** Error when update category: ", error.message);
    res.status(500).json({
      message: "Cannot update category",
    });
  }
});

// Export module
module.exports = router;
