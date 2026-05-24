const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
const addBooking = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, tableNumber, bookingDate, bookingTime } = req.body;

  const booking = new Booking({
    customerName,
    customerPhone,
    tableNumber,
    bookingDate,
    bookingTime,
  });

  const createdBooking = await booking.save();
  res.status(201).json(createdBooking);
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({}).sort({ bookingDate: -1 });
  res.json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    booking.status = req.body.status || booking.status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

module.exports = {
  addBooking,
  getBookings,
  updateBookingStatus,
};
