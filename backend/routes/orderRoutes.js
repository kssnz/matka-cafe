const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getOrders,
  getStats,
  markOrderItemsSeen,
  getMyOrders,
  updateOrderItemQty,
  cancelOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(addOrderItems).get(protect, getOrders);
router.get('/myorders', getMyOrders);
router.get('/stats', protect, getStats);
router.route('/:id').get(getOrderById).delete(protect, deleteOrder);
router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/seen').put(protect, markOrderItemsSeen);
router.route('/:id/items').put(updateOrderItemQty);
router.route('/:id/cancel').put(cancelOrder);

module.exports = router;
