const User = require("../models/User");

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
