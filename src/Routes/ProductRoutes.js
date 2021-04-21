// Import Models
const Product = require("../needToChange/Product");

// Import libraries
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");

// Configure upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/.png|.jpeg|.jpg |g/, "");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

// Validate file types
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// POST: Create a new product
router.post("/", uploadOptions.single("image"), async (req, res) => {
  // Validate request file
  const file = req.file.filename;
  if (!file) {
    return res.status(404).json({
      message: "No image found",
    });
  }

  const filename = req.file.filename;
  const basePath = `/public/uploads/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${filename}`,
    images: `${basePath}${filename}`,
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
        message: "New product is saved successfully",
        product: savedProduct,
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
    let filter = { hidden: false };
    if (req.query.categories) {
      filter = { ...filter, category: req.query.categories.split(",") };
    }

    const products = await Product.find(filter).populate("category");
    if (products) {
      res.status(200).json({
        message: "Get all products",
        count: products.length,
        products,
      });
    } else {
      res.status(404).json({
        message: "Cannot find product",
      });
    }
  } catch (error) {
    console.log("*** Cannot get list Products");
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: Get one product by ID
router.get("/:productId", async (req, res, next) => {
  const _id = req.params.productId;
  if (mongoose.isValidObjectId(_id)) {
    try {
      const product = await Product.findById({
        hidden: false,
        _id: _id,
      }).populate("category");
      if (product) {
        res.status(200).json({
          message: "Product found",
          product,
        });
      } else {
        res.status(404).json({
          message: "Don't have this product",
        });
      }
    } catch (error) {
      console.log("*** Cannot get a product: ", error.message);
      res.status(501).json({
        message: "Cannot get a product",
      });
    }
  } else {
    next();
  }
});

// PUT method: update one product
router.put("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        $set: req.body,
      },
      { new: true }
    );
    // If cannot update
    if (!updatedProduct) {
      res.status(500).json({
        message: "Cannot update product",
      });
    }
    // If update successfully
    else {
      res.status(200).json({
        message: "Updated successfully",
        product: updatedProduct,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Cannot update product ",
    });
    console.log("Error when update product: ", error.message);
  }
});

// DELETE method: hide one product
router.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(_id)) {
    return res.status(404).json({
      message: "Invalid Product ID",
    });
  }
  try {
    const hiddenProduct = await Product.findOneAndUpdate(
      { hidden: false, _id },
      { hidden: true },
      { new: true }
    );
    // If cannot hide product
    if (!hiddenProduct) {
      res.status(500).json({
        message: "Cannot delete product",
      });
    } else {
      res.status(200).json({
        message: "Product is hidden successfully",
        hiddenProduct,
      });
    }
  } catch (error) {
    console.log("Error when delete product: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get featured products

router.get("/featured", async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      hidden: false,
      isFeatured: true,
    }).populate("category");
    // If cannot find any docs
    if (!featuredProducts) {
      res.status(404).json({
        message: "No featured product found",
      });
    } else {
      res.status(200).json({
        message: "All featured products found",
        featuredProducts,
      });
    }
  } catch (error) {
    console.log("Error when get featured products: ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// PUT method: update image gallery for one product by Id
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 20),
  async (req, res) => {
    // Validate id
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        message: "Invalid product ID",
      });
    }

    // Validate files
    const files = req.files;
    if (!files) {
      return res.status(404).json({
        message: "No Image found",
      });
    }
    // Get image paths
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    files.map((file) => {
      imagePaths.push(`${basePath}${file.filename}`);
    });
    // Update images
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).json({
        message: "Cannot update image gallery",
      });
    } else {
      res.status(200).json({
        message: "Successfully",
        imageCount: files.length,
        product,
      });
    }
  }
);

// Export module
module.exports = router;
