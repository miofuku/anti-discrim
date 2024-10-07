const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous',
    maxlength: 50
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  tags: {
    type: [String],
    default: []
  },
  userType: {
    type: String,
    enum: ['immigrant', 'finnish'],
    default: 'finnish'  // Set a default value
  },
  background: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);