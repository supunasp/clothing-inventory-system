const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const ProductVariant = require('../models/ProductVariant');
const { createStaffUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

const seedCategoryBrand = async () => {
    const category = await ProductCategory.create({ categoryId: 'CAT-1', categoryName: 'Shirts' });
    const brand = await ProductBrand.create({ brandId: 'B-1', brandName: 'Nike' });
    return { category, brand };
};

describe('Product endpoints', () => {
    let user;
    let headers;

    beforeEach(async () => {
        user = await createStaffUser();
        headers = authHeader(user);
    });

    describe('POST /api/products', () => {
        it('creates a product with category and brand', async () => {
            await seedCategoryBrand();

            const res = await chai
                .request(app)
                .post('/api/products')
                .set(headers)
                .send({
                    productId: 'SH-01',
                    name: 'Office Shirt',
                    description: 'Long sleeve',
                    category: 'CAT-1',
                    brand: 'B-1',
                });

            expect(res).to.have.status(201);
            expect(res.body.product).to.include({
                productId: 'SH-01',
                name: 'Office Shirt',
                description: 'Long sleeve',
            });
            expect(res.body.product.category).to.include({ categoryId: 'CAT-1' });
            expect(res.body.product.brand).to.include({ brandId: 'B-1' });
        });

        it('rejects duplicate productId', async () => {
            const { category, brand } = await seedCategoryBrand();
            await Product.create({
                productId: 'SH-DUP',
                name: 'Existing',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .post('/api/products')
                .set(headers)
                .send({
                    productId: 'SH-DUP',
                    name: 'Another',
                    category: 'CAT-1',
                    brand: 'B-1',
                });

            expect(res).to.have.status(409);
        });

        it('rejects unknown category', async () => {
            await seedCategoryBrand();

            const res = await chai
                .request(app)
                .post('/api/products')
                .set(headers)
                .send({
                    productId: 'SH-X',
                    name: 'X',
                    category: 'CAT-MISSING',
                    brand: 'B-1',
                });

            expect(res).to.have.status(404);
        });
    });

    describe('GET /api/products (paginated with filters + inventory aggregate)', () => {
        it('returns inventory aggregate computed from variants', async () => {
            const { category, brand } = await seedCategoryBrand();
            const product = await Product.create({
                productId: 'AGG-1',
                name: 'Tee',
                category: category._id,
                brand: brand._id,
            });

            await ProductVariant.create({
                sku: 'AGG-1#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 10,
            });
            await ProductVariant.create({
                sku: 'AGG-1#Red#L',
                product: product._id,
                color: 'Red',
                size: 'L',
                stockAmount: 5,
            });

            const res = await chai
                .request(app)
                .get('/api/products?page=1&limit=10')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(1);
            expect(res.body.data[0]).to.include({
                productId: 'AGG-1',
                inventory: 15,
            });
        });

        it('filters by category and brand', async () => {
            const cat1 = await ProductCategory.create({ categoryId: 'F-CAT1', categoryName: 'Shirts' });
            const cat2 = await ProductCategory.create({ categoryId: 'F-CAT2', categoryName: 'Trousers' });
            const brand = await ProductBrand.create({ brandId: 'F-B', brandName: 'Nike' });

            await Product.create({
                productId: 'F-1',
                name: 'Match',
                category: cat1._id,
                brand: brand._id,
            });
            await Product.create({
                productId: 'F-2',
                name: 'NoMatch',
                category: cat2._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .get('/api/products?page=1&limit=10&category=F-CAT1&brand=F-B')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(1);
            expect(res.body.data[0].productId).to.equal('F-1');
        });
    });

    describe('GET /api/products/:productId', () => {
        it('returns a product', async () => {
            const { category, brand } = await seedCategoryBrand();
            await Product.create({
                productId: 'GET-1',
                name: 'Item',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai.request(app).get('/api/products/GET-1').set(headers);

            expect(res).to.have.status(200);
            expect(res.body.productId).to.equal('GET-1');
        });

        it('returns 404 when missing', async () => {
            const res = await chai
                .request(app)
                .get('/api/products/MISSING')
                .set(headers);

            expect(res).to.have.status(404);
        });
    });
});
