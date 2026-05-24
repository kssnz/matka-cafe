const mongoose = require('mongoose');

const contentSchema = mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero', 'about', 'contact'],
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // For dynamic contact details or other fields
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Content', contentSchema);
