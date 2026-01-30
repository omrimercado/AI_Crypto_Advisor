const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: {
    type: String,
    enum: ['news', 'prices', 'insight', 'meme'],
    required: true
  },
  contentId: {
    type: String,
    required: true
  },
  vote: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes on same content
feedbackSchema.index({ userId: 1, section: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
