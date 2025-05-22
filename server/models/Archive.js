const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  year: { 
    type: String, 
    required: true 
  },
  winnerName: { 
    type: String, 
    required: true 
  },
  totalVotes: { 
    type: Number, 
    required: true 
  },
  details: {
    candidateNames: [String],
    voteCounts: [String],
    winnerAddress: String,
    winnerVoteCount: String,
    startTime: String,
    endTime: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Archive", ArchiveSchema);