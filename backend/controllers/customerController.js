const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Browse products with pagination & filters
// @route   GET /api/customer/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    let sort = req.query.sort || '-createdAt';
    if (sort === 'price_asc') sort = 'price';
    if (sort === 'price_desc') sort = '-price';

    let query = { status: 'published', isDeleted: false };

    // Filter by category
    if (category && category !== 'All') {
        query.category = category;
    }

    // Text search (Case insensitive)
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('brand', 'name email') // Include brand info
        .sort(sort)
        .limit(limit)
        .skip(limit * (page - 1));

    res.json({
        products,
        page,
        pages: Math.ceil(count / limit),
        total: count
    });
});

// @desc    Get product details
// @route   GET /api/customer/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('brand', 'name email');

    if (!product || product.isDeleted || product.status !== 'published') {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json(product);
});

// @desc    Get all categories
// @route   GET /api/customer/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category', {
        status: 'published',
        isDeleted: false
    });
    res.json(categories);
});

module.exports = {
    getProducts,
    getProductById,
    getCategories
};
