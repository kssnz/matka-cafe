const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please add a customer name'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    tableNumber: {
      type: Number,
      required: [true, 'Please select a table number'],
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Confirmed',
      enum: ['Confirmed', 'Cancelled'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
