const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Archive = require('../models/Archive');

// Get all archives
router.get('/', authMiddleware, async (req, res) => {
  try {
    const archives = await Archive.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: archives
    });
  } catch (error) {
    console.error('Error fetching archives:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching archives'
    });
  }
});

// Create new archive
router.post('/', authMiddleware, async (req, res) => {
  try {
    const archive = new Archive(req.body);
    await archive.save();
    res.status(201).json({
      success: true,
      data: archive
    });
  } catch (error) {
    console.error('Error creating archive:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating archive'
    });
  }
});

module.exports = router;