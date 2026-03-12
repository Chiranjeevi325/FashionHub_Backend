const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const verifyProductOwnership = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.brand.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this product');
    }

    next();
});

module.exports = { verifyProductOwnership };
