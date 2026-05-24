const asyncHandler = require('express-async-handler');
const Content = require('../models/Content');

// @desc    Get content by section
// @route   GET /api/content/:section
// @access  Public
const getContentBySection = asyncHandler(async (req, res) => {
  const content = await Content.findOne({ section: req.params.section });

  if (content) {
    res.json(content);
  } else {
    res.status(404);
    throw new Error('Content not found');
  }
});

// @desc    Update or create content by section
// @route   POST /api/content
// @access  Private/Admin
const updateContent = asyncHandler(async (req, res) => {
  const { section, title, subtitle, description, image, details } = req.body;

  const content = await Content.findOne({ section });

  if (content) {
    content.title = title || content.title;
    content.subtitle = subtitle || content.subtitle;
    content.description = description || content.description;
    content.image = image || content.image;
    content.details = details || content.details;

    const updatedContent = await content.save();
    res.json(updatedContent);
  } else {
    const newContent = new Content({
      section,
      title,
      subtitle,
      description,
      image,
      details,
    });

    const createdContent = await newContent.save();
    res.status(201).json(createdContent);
  }
});

module.exports = {
  getContentBySection,
  updateContent,
};
