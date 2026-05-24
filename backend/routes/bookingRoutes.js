const express = require('express');
const router = express.Router();
const {
  addBooking,
  getBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(addBooking).get(protect, getBookings);
router.route('/:id').put(protect, updateBookingStatus);

module.exports = router;
