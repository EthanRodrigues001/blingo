const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null  // Default to null if no image URL provided
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [optionSchema],  // Array of optionSchema objects
    required: true
  },
  imageUrl: {
    type: String,
    default: null  // Default to null if no main image URL provided
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
