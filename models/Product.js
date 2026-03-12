const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
    },
    images: [{
        type: String,
        required: true,
    }],
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
