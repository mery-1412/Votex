const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:id/:token", authController.resetPassword); 
router.post('/logout', authController.logout)
module.exports = router;
