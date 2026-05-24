const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const {
    findCategoryDocumentByCategoryId,
} = require('./productCategoryService');
const {
    findBrandDocumentByBrandId,
} = require('./productBrandService');

const createProduct = async ({productId, name, description, category, brand}) => {
    if (!productId || !name || !category || !brand) {
        const error = new Error('productId, name, brand and category are required');
        error.statusCode = 400;
        throw error;
    }

    const existingProduct = await Product.findOne({productId});

    if (existingProduct) {
        const error = new Error('Product with this productId already exists');
        error.statusCode = 409;
        throw error;
    }

    const existingCategory = await findCategoryDocumentByCategoryId(category);
    const existingBrand = await findBrandDocumentByBrandId(brand);

    const product = await Product.create({
        productId: productId,
        name: name,
        description: description,
        category: existingCategory._id,
        brand: existingBrand._id,
    });

    return Product.findById(product._id).populate('category').populate('brand');
};

const getProducts = async () => {
    return Product.find()
        .populate('category')
        .populate('brand')
        .sort({createdAt: -1});
};

const getProductsPaginated = async ({limit, skip, category, brand, search}) => {
    const filter = {};

    if (search) {
        filter.$or = [
            {productId: {$regex: search, $options: 'i'}},
            {name: {$regex: search, $options: 'i'}},
            {description: {$regex: search, $options: 'i'}},
        ];
    }

    const query = Product.find(filter)
        .populate('category')
        .populate('brand')
        .sort({createdAt: -1});

    const products = await query.skip(skip).limit(limit);
    const totalItems = await Product.countDocuments(filter);

    const productIds = products.map((product) => product._id);

    const inventorySummary = await ProductVariant.aggregate([
        {
            $match: {
                product: {$in: productIds},
            },
        },
        {
            $group: {
                _id: '$product',
                inventory: {$sum: '$stockAmount'},
            },
        },
    ]);

    const inventoryMap = inventorySummary.reduce((map, item) => {
        map[item._id.toString()] = item.inventory;
        return map;
    }, {});

    const data = products
        .filter((product) => {
            const matchesCategory = category ? product.category?.categoryId === category : true;
            const matchesBrand = brand ? product.brand?.brandId === brand : true;

            return matchesCategory && matchesBrand;
        })
        .map((product) => ({
            product,
            inventory: inventoryMap[product._id.toString()] || 0,
        }));

    return {
        data,
        totalItems,
    };
};

const getProductById = async (productId) => {
    const product = await Product.findOne({productId}).populate('category').populate('brand');

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
};

const updateProduct = async (productId, {name, description, category, brand}) => {
    const updateData = {};

    if (name !== undefined) {
        updateData.name = name;
    }

    if (description !== undefined) {
        updateData.description = description;
    }

    if (category !== undefined) {
        const existingCategory = await findCategoryDocumentByCategoryId(category);
        updateData.category = existingCategory._id;
    }


    if (brand !== undefined) {
        const existingBrand = await findBrandDocumentByBrandId(category);
        updateData.brand = existingBrand._id;
    }

    const updatedProduct = await Product.findOneAndUpdate(
        {productId},
        updateData,
        {
            new: true,
            runValidators: true,
        })
        .populate('category')
        .populate('brand');

    if (!updatedProduct) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return updatedProduct;
};

const deleteProduct = async (productId) => {
    const deletedProduct = await Product
        .findOneAndDelete({productId})
        .populate('category')
        .populate('brand');

    if (!deletedProduct) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return deletedProduct;
};

const findProductDocumentByProductId = async (productId) => {
    const product = await Product.findOne({productId: productId});

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
};

module.exports = {
    createProduct,
    getProducts,
    getProductsPaginated,
    getProductById,
    updateProduct,
    deleteProduct,
    findProductDocumentByProductId,
};