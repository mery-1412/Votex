const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ["voter", "admin"], 
    default: "voter"

  }
});

module.exports = mongoose.model("User", UserSchema);
