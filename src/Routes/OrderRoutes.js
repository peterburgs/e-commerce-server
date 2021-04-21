const express = require("express");
const { mongo } = require("mongoose");
const multer = require("multer");

// Import model
const Order = require("../needToChange/Order");
const OrderItem = require("../needToChange/OrderItem");

const router = express.Router();

// POST method: create new order
router.post("/", async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      try {
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      } catch (error) {
        console.log("Error when create new order item");
      }
    })
  );

  const orderItemIdsResolved = await orderItemIds;

  // Calculate total price of the order
  const totalPriceList = await Promise.all(
    orderItemIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      return orderItem.product.price * orderItem.quantity;
    })
  );
  const totalPrice = totalPriceList.reduce(
    (accumulator, currentVal) => accumulator + currentVal,
    0
  );
  let order = new Order({
    orderItems: orderItemIdsResolved,
    shippingAddress: req.body.shippingAddress,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    dateCreated: req.body.dateCreated,
    isHidden: req.body.isHidden,
  });
  try {
    order = await order.save();
    if (!order) {
      res.status(500).json({
        message: "Cannot save order",
      });
    }
    return res.status(201).json({
      message: "Create new order successfully",
      order,
    });
  } catch (error) {
    console.log("Error when save order");
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get all
router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find({ isHidden: false })
      .populate("user")
      .sort([["dateCreated", -1]]);
    if (!orderList) {
      res.status(404).json({
        message: "Cannot find order",
      });
    } else {
      res.status(200).json({
        message: "Found",
        count: orderList.length,
        orderList,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get one with ID
router.get(`/:id`, async (req, res, next) => {
  // Validate mongoose ID
  if (mongo.ObjectID.isValid(req.params.id)) {
    try {
      const order = await Order.findById(req.params.id)
        .populate("user")
        .populate({ path: "orderItems", populate: "product" });
      console.log("*** ", order);
      if (!order) {
        res.status(500).json({
          message: "Cannot get order",
        });
      } else {
        res.status(200).json({
          message: "Found",
          order,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  } else {
    next;
  }
});

// PUT method: Update one by ID
router.put(`/:id`, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!order) {
      res.status(500).json({
        message: "Cannot update order",
      });
    } else {
      res.status(200).json({
        message: "Order is updated successfully",
        order,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE method: delete one by ID
router.delete(`/:id`, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isHidden: true },
      { new: true }
    );
    if (!order) {
      res.status(500).json({
        message: "Cannot delete order",
      });
    } else {
      // Delete the orderItems belong to that Order
      await order.orderItems.map(async (item) => {
        await OrderItem.findByIdAndUpdate(
          item,
          { isHidden: true },
          { new: true }
        );
        return res.status(200).json({
          message: "All order items are deleted successfully",
        });
      });
      res.status(200).json({
        message: "Order and items are deleted successfully",
        order,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get total sales
router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    if (!totalSales) {
      return res.status(400).json({
        message: "The order sales cannot be generated",
      });
    }
    return res.status(200).json({
      message: "Successfully",
      totalsales: totalSales,
    });
  } catch (error) {
    console.log("*** ", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET method: get orders of a user by userId
router.get("/get/userorders/:userid", async (req, res) => {
  try {
    const userOrderList = await Order.find({
      user: req.params.userid,
    })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateCreated: -1 });
    if (!userOrderList) {
      res.status(500).json({
        message: "Cannot get user orders",
      });
    } else {
      res.status(200).json({
        message: "Successfully",
        userOrderList,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Export router
module.exports = router;
