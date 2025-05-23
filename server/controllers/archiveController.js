const Archive = require("../models/Archive");
const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

// Get all archives
router.get("/", authMiddleware, async (req, res) => {
  try {
    const archives = await Archive.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: archives
    });
  } catch (error) {
    console.error("Error fetching archives:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching archives"
    });
  }
});

// Create new archive
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Check if session is already archived
    const exists = await Archive.findOne({ sessionId: req.body.sessionId });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: "This session is already archived"
      });
    }

    const archive = new Archive(req.body);
    await archive.save();

    res.status(201).json({
      success: true,
      data: archive
    });
  } catch (error) {
    console.error("Error creating archive:", error);
    res.status(500).json({
      success: false,
      error: "Error creating archive"
    });
  }
});

// Get specific archive
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const archive = await Archive.findOne({ sessionId: req.params.id });
    if (!archive) {
      return res.status(404).json({
        success: false,
        error: "Archive not found"
      });
    }

    res.status(200).json({
      success: true,
      data: archive
    });
  } catch (error) {
    console.error("Error fetching archive:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching archive"
    });
  }
});

module.exports = router;