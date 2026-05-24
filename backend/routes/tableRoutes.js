const express = require('express');
const router = express.Router();
const { getTables, occupyTable, releaseTable, verifyTablePin } = require('../controllers/tableController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getTables);
router.post('/occupy', occupyTable);
router.post('/release/:id', protect, releaseTable);
router.post('/verify-pin', verifyTablePin);

module.exports = router;
