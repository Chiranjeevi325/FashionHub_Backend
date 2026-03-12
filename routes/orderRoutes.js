const express = require('express');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById);

module.exports = router;
