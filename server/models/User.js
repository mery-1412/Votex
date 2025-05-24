const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  walletAddress: { type: String, default: null }, // Store the linked wallet
  hasVoted: { type: Boolean, default: false }, // Track if user has voted
  role: { 
    type: String, 
    enum: ["voter", "admin"], 
    default: "voter"
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", UserSchema);