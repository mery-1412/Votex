const bcrypt = require("bcrypt"); // Instead of bcrypt
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/email');
const {hashPassword,ComparePassword}=require('../helpers/auth');
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid"); 
const sessionStore = require("../sessionStore");

exports.signup = async (req, res) => {
  try {
    const { idNumber, email, password } = req.body;

    const existingId = await User.findOne({ idNumber });
    if (!existingId) {
      return res.status(400).json({ error: "ID number not found in records. Registration denied!" });
    }

    if (existingId.email || existingId.password) {
      return res.status(400).json({ error: "This ID number is already registered. Please log in." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&_*])(?=.*\d).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long and include at least one uppercase letter, one special character, and one digit.",
      });
    }

    const hashedPassword = await hashPassword(password);
    existingId.email = email;
    existingId.password = hashedPassword;
    await existingId.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: existingId._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};



exports.login = async (req, res) => {
  try {
    
    
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with given email not found",
      });
    }

    const match = await ComparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    const sessionId = uuidv4();
    sessionStore.set(sessionId, token); 


    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true, // Use HTTPS in production
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: user
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

exports.forgotPassword=async(req,res)=>{
  try{
  const {email}=req.body
  const user=await User.findOne({email})
  if(!user){
    return res.status(400).json({message: "Email Not Found"})
  }
  const secret=process.env.JWT_SECRET+user.password
  const token =jwt.sign(
    {id:user._id},
    secret,
    {expiresIn:'5m'}

  )
  const link = `http://localhost:3000/reset-password/${user._id}/${token}`;
 
     // Send the reset password email
     await sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              background-color: #0a0a23;
              font-family: 'Arial', sans-serif;
              color: #ffffff;
              text-align: center;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 100%;
              padding: 20px;
            }
            .email-box {
              background: linear-gradient(135deg, #1a1a40, #4b0082);
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0px 4px 15px rgba(100, 0, 200, 0.4);
              max-width: 500px;
              margin: 20px auto;
              text-align: center;
            }
            .email-box h2 {
              color: #c084fc;
            }
            .email-box p {
              font-size: 16px;
              color: #dcdcdc;
            }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              margin-top: 15px;
              font-size: 16px;
              font-weight: bold;
              color: #ffffff !important; /* Ensure button text is white */
              background: linear-gradient(90deg, #8a2be2, #6a0dad);
              border-radius: 8px;
              text-decoration: none !important; /* Remove blue underline */
              box-shadow: 0px 4px 10px rgba(138, 43, 226, 0.4);
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn:hover {
              transform: scale(1.05);
              box-shadow: 0px 6px 20px rgba(138, 43, 226, 0.6);
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-box">
              <h2>Reset Your Password</h2>
              <p>We've received a request to reset your password. Click the button below to continue.</p>
              <a href="${link}" class="btn">Reset Password</a>
              <p class="footer">If you did not request this, ignore this email. This link will expire in <strong>5 minutes</strong>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    // Send a success response
    res.status(200).json({ message: "Password reset link sent to your email" });
  }catch(err){
    res.status(400).json(err)
  }
}


exports.resetPassword = async (req, res) => {
  try {

    const { id, token } = req.params; 
    const { password } = req.body; 

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, secret);

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ message: "Invalid or expired token", error: err });
  }
};

exports.logout = async(req, res) => {
  res.clearCookie("sessionId");
  res.status(200).json({ message: "Logged out successfully" });
}