const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const ProductVariant = require('../models/ProductVariant');
const InventoryAudit = require('../models/InventoryAudit');
const { createStaffUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

const seedProduct = async (productId = 'P-1') => {
    const category = await ProductCategory.create({
        categoryId: `${productId}-CAT`,
        categoryName: 'Shirts',
    });
    const brand = await ProductBrand.create({
        brandId: `${productId}-B`,
        brandName: 'Nike',
    });
    const product = await Product.create({
        productId,
        name: 'Office Shirt',
        category: category._id,
        brand: brand._id,
    });
    return { category, brand, product };
};

describe('ProductVariant endpoints', () => {
    let user;
    let headers;

    beforeEach(async () => {
        user = await createStaffUser();
        headers = authHeader(user);
    });

    describe('POST /api/products/variants', () => {
        it('creates a variant with SKU and initial audit', async () => {
            await seedProduct('P-CV');

            const res = await chai
                .request(app)
                .post('/api/products/variants')
                .set(headers)
                .send({
                    productId: 'P-CV',
                    color: 'Blue',
                    size: 'M',
                    stockAmount: 8,
                    reference: 'PO-1001',
                });

            expect(res).to.have.status(201);
            expect(res.body.product).to.include({
                sku: 'P-CV#Blue#M',
                color: 'Blue',
                size: 'M',
                stockAmount: 8,
            });

            const audits = await InventoryAudit.find();
            expect(audits).to.have.length(1);
            expect(audits[0]).to.include({
                sku: 'P-CV#Blue#M',
                type: 'increase',
                amount: 8,
                quantityBefore: 0,
                quantityAfter: 8,
                reference: 'PO-1001',
            });
            expect(audits[0].updatedBy.toString()).to.equal(user._id.toString());
        });

        it('rejects duplicate variant (same product/color/size)', async () => {
            await seedProduct('P-DUP');

            await chai
                .request(app)
                .post('/api/products/variants')
                .set(headers)
                .send({
                    productId: 'P-DUP',
                    color: 'Blue',
                    size: 'M',
                    stockAmount: 5,
                    reference: 'R1',
                });

            const res = await chai
                .request(app)
                .post('/api/products/variants')
                .set(headers)
                .send({
                    productId: 'P-DUP',
                    color: 'Blue',
                    size: 'M',
                    stockAmount: 3,
                    reference: 'R2',
                });

            expect(res).to.have.status(409);
        });

        it('rejects when reference is missing', async () => {
            await seedProduct('P-NOREF');

            const res = await chai
                .request(app)
                .post('/api/products/variants')
                .set(headers)
                .send({
                    productId: 'P-NOREF',
                    color: 'White',
                    size: 'XS',
                    stockAmount: 4,
                });

            expect(res).to.have.status(400);
        });
    });

    describe('GET /api/products/variants', () => {
        it('filters by productId', async () => {
            const { product: p1 } = await seedProduct('P-A');
            const { product: p2 } = await seedProduct('P-B');

            await ProductVariant.create({
                sku: 'P-A#Blue#M',
                product: p1._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 5,
            });
            await ProductVariant.create({
                sku: 'P-B#Red#L',
                product: p2._id,
                color: 'Red',
                size: 'L',
                stockAmount: 7,
            });

            const res = await chai
                .request(app)
                .get('/api/products/variants?productId=P-A')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.length(1);
            expect(res.body[0]).to.include({ sku: 'P-A#Blue#M', productId: 'P-A' });
        });
    });

    describe('POST /api/products/variants/:sku/inventory', () => {
        const setupVariant = async (initialStock = 10) => {
            const { product } = await seedProduct('P-INV');
            return ProductVariant.create({
                sku: 'P-INV#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: initialStock,
            });
        };

        it('increases stock and creates an audit', async () => {
            await setupVariant(10);

            const res = await chai
                .request(app)
                .post('/api/products/variants/P-INV%23Blue%23M/inventory')
                .set(headers)
                .send({ type: 'increase', amount: 5, reference: 'PO-2001' });

            expect(res).to.have.status(200);
            expect(res.body.variant.stockAmount).to.equal(15);

            const audit = await InventoryAudit.findOne({ sku: 'P-INV#Blue#M' });
            expect(audit).to.include({
                type: 'increase',
                amount: 5,
                quantityBefore: 10,
                quantityAfter: 15,
                reference: 'PO-2001',
            });
        });

        it('decreases stock and creates an audit', async () => {
            await setupVariant(10);

            const res = await chai
                .request(app)
                .post('/api/products/variants/P-INV%23Blue%23M/inventory')
                .set(headers)
                .send({ type: 'decrease', amount: 3, reference: 'SO-3001' });

            expect(res).to.have.status(200);
            expect(res.body.variant.stockAmount).to.equal(7);

            const audit = await InventoryAudit.findOne({ sku: 'P-INV#Blue#M' });
            expect(audit).to.include({
                type: 'decrease',
                amount: 3,
                quantityBefore: 10,
                quantityAfter: 7,
            });
        });

        it('rejects decrease beyond available stock', async () => {
            await setupVariant(5);

            const res = await chai
                .request(app)
                .post('/api/products/variants/P-INV%23Blue%23M/inventory')
                .set(headers)
                .send({ type: 'decrease', amount: 10, reference: 'SO-OVER' });

            expect(res).to.have.status(400);
            expect(res.body.message).to.match(/Insufficient stock/);
        });

        it('rejects missing reference', async () => {
            await setupVariant(5);

            const res = await chai
                .request(app)
                .post('/api/products/variants/P-INV%23Blue%23M/inventory')
                .set(headers)
                .send({ type: 'increase', amount: 1 });

            expect(res).to.have.status(400);
        });
    });

    describe('GET /api/products/variants/:sku', () => {
        it('returns the variant by sku', async () => {
            const { product } = await seedProduct('P-GET');
            await ProductVariant.create({
                sku: 'P-GET#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 4,
            });

            const res = await chai
                .request(app)
                .get('/api/products/variants/P-GET%23Blue%23M')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body).to.include({
                sku: 'P-GET#Blue#M',
                productId: 'P-GET',
                color: 'Blue',
                size: 'M',
                stockAmount: 4,
            });
        });

        it('returns 404 for an unknown sku', async () => {
            const res = await chai
                .request(app)
                .get('/api/products/variants/UNKNOWN%23X%23Y')
                .set(headers);

            expect(res).to.have.status(404);
        });
    });

    describe('PUT /api/products/variants/:sku', () => {
        it('updates the stock amount', async () => {
            const { product } = await seedProduct('P-PUT');
            await ProductVariant.create({
                sku: 'P-PUT#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 2,
            });

            const res = await chai
                .request(app)
                .put('/api/products/variants/P-PUT%23Blue%23M')
                .set(headers)
                .send({ stockAmount: 9 });

            expect(res).to.have.status(200);
            expect(res.body.product).to.include({
                sku: 'P-PUT#Blue#M',
                stockAmount: 9,
            });
        });

        it('returns 404 for an unknown sku', async () => {
            const res = await chai
                .request(app)
                .put('/api/products/variants/UNKNOWN%23X%23Y')
                .set(headers)
                .send({ stockAmount: 1 });

            expect(res).to.have.status(404);
        });
    });

    describe('DELETE /api/products/variants/:sku', () => {
        it('deletes the variant', async () => {
            const { product } = await seedProduct('P-DEL');
            await ProductVariant.create({
                sku: 'P-DEL#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 1,
            });

            const res = await chai
                .request(app)
                .delete('/api/products/variants/P-DEL%23Blue%23M')
                .set(headers);

            expect(res).to.have.status(200);
            const remaining = await ProductVariant.countDocuments({ sku: 'P-DEL#Blue#M' });
            expect(remaining).to.equal(0);
        });

        it('returns 404 for an unknown sku', async () => {
            const res = await chai
                .request(app)
                .delete('/api/products/variants/UNKNOWN%23X%23Y')
                .set(headers);

            expect(res).to.have.status(404);
        });
    });
});
