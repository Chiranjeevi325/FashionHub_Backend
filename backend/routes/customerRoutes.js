const express = require('express');
const { getProducts, getProductById, getCategories } = require('../controllers/customerController');

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);

module.exports = router;
