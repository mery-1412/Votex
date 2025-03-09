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


exports.getUser =async(req, res) => {
  const token = req.cookies.token;
  console.log("token baack", token);
  
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    console.log("INSIDE TRY")

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    console.log("decoded", decoded)

    const user = await User.findById(userId).select("-password"); 

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log('back user getUser',user);
    
    res.json(user);
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}