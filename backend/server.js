const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Clothing Inventory API is running',
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/productCategoryRoutes'));
app.use('/api/brands', require('./routes/productBrandRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/products/variants', require('./routes/productVariantRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Export the app object for testing
if (require.main === module) {
    connectDB();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}


module.exports = app
