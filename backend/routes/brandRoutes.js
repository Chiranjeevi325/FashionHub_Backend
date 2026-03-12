const express = require('express');
const {
    getDashboardStats,
    createProduct,
    getBrandProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { verifyProductOwnership } = require('../middleware/brandMiddleware');
let upload;
try {
    upload = require('../config/cloudinary').upload;
} catch (e) {
    // Cloudinary not configured, skip file upload middleware
}

// Optional upload middleware — catches Cloudinary errors and returns a clear error
const optionalUpload = (req, res, next) => {
    if (upload && req.headers['content-type']?.includes('multipart/form-data')) {
        return upload.array('images', 5)(req, res, (err) => {
            if (err) {
                console.warn('Cloudinary upload failed:', err.message);
                return res.status(400).json({
                    message: 'Image upload failed: ' + err.message + '. Please use Image URL mode instead.'
                });
            }
            next();
        });
    }
    next();
};

const router = express.Router();

// All brand routes require authentication and brand role
router.use(protect);
router.use(authorize('brand'));

router.get('/dashboard', getDashboardStats);

router.route('/products')
    .get(getBrandProducts)
    .post(optionalUpload, createProduct);

router.route('/products/:id')
    .get(verifyProductOwnership, getProductById)
    .put(verifyProductOwnership, optionalUpload, updateProduct)
    .delete(verifyProductOwnership, deleteProduct);

module.exports = router;
