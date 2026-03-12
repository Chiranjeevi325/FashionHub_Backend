const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create order (from cart or buy now)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod = 'COD' } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
        res.status(400);
        throw new Error('Please provide a complete shipping address');
    }

    // Build order items with current product data
    const orderItems = [];
    let total = 0;

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
            quantity: item.quantity,
        });
        total += product.price * item.quantity;
    }

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        total,
        shippingAddress,
        paymentMethod,
    });

    // Clear cart if order came from cart
    if (req.body.fromCart) {
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] }
        );
    }

    res.status(201).json(order);
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json(order);
});

module.exports = { createOrder, getOrders, getOrderById };
