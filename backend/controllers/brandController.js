const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard summary statistics
// @route   GET /api/brand/dashboard
// @access  Private/Brand
const getDashboardStats = asyncHandler(async (req, res) => {
    const brandId = req.user._id;

    const total = await Product.countDocuments({ brand: brandId, isDeleted: false });
    const published = await Product.countDocuments({ brand: brandId, status: 'published', isDeleted: false });
    const draft = await Product.countDocuments({ brand: brandId, status: 'draft', isDeleted: false });
    const archived = await Product.countDocuments({ brand: brandId, isDeleted: true });

    res.json({ total, published, draft, archived });
});

// @desc    Create new product
// @route   POST /api/brand/products
// @access  Private/Brand
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, status } = req.body;

    // Support both file uploads (Cloudinary) and image URLs from JSON body
    let images = [];
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => file.path);
    } else if (req.body.images) {
        images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (images.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one image');
    }

    const product = await Product.create({
        name,
        description,
        price,
        category,
        status: status || 'published',
        images,
        brand: req.user._id,
    });

    res.status(201).json(product);
});

// @desc    Get all brand products (with pagination)
// @route   GET /api/brand/products
// @access  Private/Brand
const getBrandProducts = asyncHandler(async (req, res) => {
    const brandId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = { brand: brandId, isDeleted: false };
    if (status) query.status = status;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * (page - 1));

    res.json({
        products,
        page,
        pages: Math.ceil(count / limit),
        total: count
    });
});

// @desc    Get single product
// @route   GET /api/brand/products/:id
// @access  Private/Brand
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json(product);
});

// @desc    Update product
// @route   PUT /api/brand/products/:id
// @access  Private/Brand
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, status, imagesToRemove } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Update simple fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.status = status || product.status;

    // Handle new images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path);
        product.images = [...product.images, ...newImages];
    }

    // Handle removal of existing images
    if (imagesToRemove) {
        const toRemove = Array.isArray(imagesToRemove) ? imagesToRemove : [imagesToRemove];
        product.images = product.images.filter(img => !toRemove.includes(img));
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

// @desc    Soft delete product
// @route   DELETE /api/brand/products/:id
// @access  Private/Brand
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.isDeleted = true;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
});

module.exports = {
    getDashboardStats,
    createProduct,
    getBrandProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
