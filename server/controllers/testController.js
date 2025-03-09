const User = require("../models/User");
const jwt = require('jsonwebtoken');


exports.addTestUsers = async (req, res) => {
  try {
    const testUsers = [
        { idNumber: "123456789" },
        { idNumber: "987654321" },
        { idNumber: "111222333" },
        { idNumber: "444555666" },
        { idNumber: "777888999" },
        { idNumber: "101112131" },
        { idNumber: "141516171" },
        { idNumber: "181920212" },
        { idNumber: "222324252" },
        { idNumber: "262728293" },
        { idNumber: "303132333" },
    ];

    for (const user of testUsers) {
      await User.updateOne(
        { idNumber: user.idNumber }, 
        { $setOnInsert: user }, 
        { upsert: true } 
      );
    }

    res.status(201).json({
      success: true,
      message: "Test users added successfully!",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ idNumber: user.idNumber, email: user.email, role: user.userRole });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
