const mongoose = require("mongoose");
require("mongoose-type-email");

// Error message
mongoose.SchemaTypes.Email.defaults.message = "Email address is invalid";

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    default: "John",
  },
  lastName: {
    type: String,
    default: "Doe",
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true,
    correctId: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

// Export schema
module.exports = mongoose.model("User", userSchema);
