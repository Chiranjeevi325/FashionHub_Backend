const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const User = require('./models/User');

const productsData = [
    {
        name: 'Classic White Sneakers',
        description: 'Premium white leather sneakers with a minimalist design. Perfect for any casual outfit.',
        price: 89.99,
        category: 'Shoes',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772'],
        status: 'published',
        stock: 50,
        tags: ['casual', 'summer', 'minimalist']
    },
    {
        name: 'Denim Jacket',
        description: 'Classic blue denim jacket with a comfortable fit. Durable and stylish.',
        price: 65.00,
        category: 'Outerwear',
        images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2'],
        status: 'published',
        stock: 30,
        tags: ['denim', 'casual', 'winter']
    },
    {
        name: 'Floral Summer Dress',
        description: 'Lightweight floral dress perfect for beach days or summer evenings.',
        price: 45.99,
        category: 'Women',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446'],
        status: 'published',
        stock: 25,
        tags: ['dress', 'summer', 'floral']
    },
    {
        name: 'Cotton Polo Shirt',
        description: 'High-quality cotton polo shirt in navy blue. A must-have for every wardrobe.',
        price: 35.00,
        category: 'Men',
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820'],
        status: 'published',
        stock: 100,
        tags: ['polo', 'casual', 'cotton']
    },
    {
        name: 'Leather Handbag',
        description: 'Elegant black leather handbag with gold accents. Plenty of space for essentials.',
        price: 120.00,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3'],
        status: 'published',
        stock: 15,
        tags: ['leather', 'bag', 'premium']
    },
    {
        name: 'Running Shorts',
        description: 'Breathable and lightweight running shorts with a zip pocket.',
        price: 29.99,
        category: 'Sports',
        images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b'],
        status: 'published',
        stock: 40,
        tags: ['sports', 'running', 'activewear']
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Create a dummy brand user if not exists
        let brandUser = await User.findOne({ role: 'brand' });
        if (!brandUser) {
            brandUser = await User.create({
                name: 'FashionHub Official',
                email: 'brand@fashionhub.com',
                password: 'password123',
                role: 'brand'
            });
            console.log('Created dummy brand user.');
        }

        // 2. Prepare products with brand ID
        const products = productsData.map(p => ({
            ...p,
            brand: brandUser._id
        }));

        // 3. Clear existing products (optional)
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        // 4. Insert new products
        await Product.insertMany(products);
        console.log('Successfully seeded database with products!');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
