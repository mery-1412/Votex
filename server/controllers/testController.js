const User = require("../models/User");
const jwt = require('jsonwebtoken');


exports.addTestUsers = async (req, res) => {
  try {
    const testUsers = [
        { idNumber: "123456455" },
        { idNumber: "987654321234" },
        { idNumber: "111222333432" },
        { idNumber: "44455566645678765" },
        { idNumber: "77788899967654" },
        { idNumber: "101112131T45" },
        { idNumber: "1415161713456" },
        { idNumber: "181920212456" },
        { idNumber: "222324252787654" },
        { idNumber: "2627282934567" },
        { idNumber: "303132333Z456" },
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
    console.log("user role",user.role);
    
    return res.json({ id: user._id, idNumber: user.idNumber, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
