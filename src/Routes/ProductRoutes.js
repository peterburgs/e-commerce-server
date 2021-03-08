// Import Models
const Product = require("../models/Product");

// Import libraries
const express = require("express");

const router = express.Router();

// POST: Create a new product
router.post("/", async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    countInStock: req.body.countInStock,
    category: req.body.category,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
    hidden: req.body.hidden,
  });
  try {
    const savedProduct = await product.save();
    if (savedProduct) {
      console.log("*** New product is saved successfully ");
      res.status(201).json({
        product: savedProduct,
        message: "New product is saved successfully",
      });
    } else {
      res.status(500).json({
        message: "Can not create new product",
      });
    }
  } catch (error) {
    console.log("*** ", error.message);
  }
});

//GET: Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (products) {
      res.status(201).json({
        products,
        message: "Get all products",
      });
    } else {
      res.status(404).json({
        message: "Cannot find product",
      });
    }
  } catch (error) {
    console.log("*** Can not get list Products");
    res.status(500).json({
      message: "Can not get list of Products",
    });
  }
});

// GET method: Get 1 product
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (product) {
      res.status(200).json({
        product,
        message: "Retrieve a product",
      });
    } else {
      res.status(400).json({
        message: "Don't have this product",
      });
    }
  } catch (error) {
    console.log("*** Can not get list Products");
    res.status(500).json({
      message: "Can not get a Product",
    });
  }
});

// Export module
module.exports = router;
