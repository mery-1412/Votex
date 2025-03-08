require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
});

const sendMail = async ({ to, subject, html }) => {  
  const mailOptions = {
    from: `"Votex team" <${process.env.EMAIL_USER}>`,
    to, 
    subject, 
    html,  
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully!");
  } catch (err) {
    console.error("Error sending mail:", err);
    throw err; 
  }
};

module.exports = sendMail;
