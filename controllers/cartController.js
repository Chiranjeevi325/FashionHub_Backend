const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images brand category');

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.isDeleted || product.status !== 'published') {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images brand category');

    res.json(cart);
});

// @desc    Update item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        cart.items.pull(req.params.itemId);
    } else {
        item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name price images brand category');

    res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name price images brand category');

    res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
