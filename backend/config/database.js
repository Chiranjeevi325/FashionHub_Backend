const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('The server will continue to run, but database-dependent features (signup, login, etc.) will fail until MongoDB is started.');
    }
};

module.exports = connectDB;
