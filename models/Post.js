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
  type: {
    type: String,
    required: true,
    enum: ['general', 'question', 'idea']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);