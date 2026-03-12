const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const testConnection = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }
};

testConnection();
