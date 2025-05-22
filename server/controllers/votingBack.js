const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Link wallet to user account
router.post("/link-wallet", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "Wallet address is required" });
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();

    const existingUserWithWallet = await User.findOne({
      walletAddress: normalizedWalletAddress,
      _id: { $ne: req.user.id },
    });
 
    if (existingUserWithWallet) {
      return res.status(409).json({
        success: false,
        error: "This wallet address is already linked to another account",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress: normalizedWalletAddress },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Wallet linked successfully",
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Error linking wallet:", error);
    return res.status(500).json({ success: false, error: "Server error when linking wallet" });
  }
});

// Verify if wallet belongs to user
router.get("/verify-wallet", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "Wallet address is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isVerified = user.walletAddress && user.walletAddress.toLowerCase() === walletAddress.toLowerCase();

    console.log("WBAAAAAAAAAAAAAAACK:", isVerified, "for user:", user._id);

    return res.status(200).json({ success: true, isVerified });
  } catch (error) {
    console.error("Error verifying wallet:", error);
    return res.status(500).json({ success: false, error: "Server error when verifying wallet" });
  }
});

// Check if user has already voted
router.get("/check-voted", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      hasVoted: user.hasVoted
    });
  } catch (error) {
    console.error("Error checking vote status:", error);
    return res.status(500).json({
      success: false,
      error: "Server error when checking vote status"
    });
  }
});

// Record that user has voted
router.post("/record-vote", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    const updates = { 
      hasVoted: true,
    };
    
    // If wallet address provided, save it
    if (walletAddress) {
      updates.walletAddress = walletAddress.toLowerCase();
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      updates,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully"
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    return res.status(500).json({
      success: false,
      error: "Server error when recording vote"
    });
  }
});

// Add this new endpoint to check if wallet has been used by any user
router.get("/check-wallet-used", async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: "Wallet address is required" 
      });
    }

    // Check if any user has used this wallet address to vote
    const userWithWallet = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
      hasVoted: true
    });

    return res.status(200).json({
      success: true,
      isUsed: !!userWithWallet
    });
  } catch (error) {
    console.error("Error checking wallet usage:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error when checking wallet usage" 
    });
  }
});

module.exports = router;