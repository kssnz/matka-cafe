const express = require('express');
const router = express.Router();
const {
  getContentBySection,
  updateContent,
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, updateContent);
router.route('/:section').get(getContentBySection);

module.exports = router;
