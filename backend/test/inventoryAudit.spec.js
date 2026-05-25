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

describe('InventoryAudit endpoints', () => {
    let user;
    let headers;

    beforeEach(async () => {
        user = await createStaffUser();
        headers = authHeader(user);
    });

    describe('GET /api/inventory-audits', () => {
        it('returns paginated audits with variant/product/updatedBy populated', async () => {
            const category = await ProductCategory.create({ categoryId: 'C', categoryName: 'Shirts' });
            const brand = await ProductBrand.create({ brandId: 'B', brandName: 'Nike' });
            const product = await Product.create({
                productId: 'AUD-1',
                name: 'Tee',
                category: category._id,
                brand: brand._id,
            });
            const variant = await ProductVariant.create({
                sku: 'AUD-1#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 5,
            });

            await InventoryAudit.create({
                productVariant: variant._id,
                sku: variant.sku,
                type: 'increase',
                amount: 5,
                quantityBefore: 0,
                quantityAfter: 5,
                reference: 'PO-1',
                updatedBy: user._id,
            });

            const res = await chai
                .request(app)
                .get('/api/inventory-audits?page=1&limit=10')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(1);
            expect(res.body.data[0]).to.include({
                sku: 'AUD-1#Blue#M',
                color: 'Blue',
                size: 'M',
                type: 'increase',
                amount: 5,
                quantityBefore: 0,
                quantityAfter: 5,
                reference: 'PO-1',
            });
            expect(res.body.data[0].product).to.include({ productId: 'AUD-1', name: 'Tee' });
            expect(res.body.data[0].updatedBy).to.include({
                firstName: user.firstName,
                email: user.email,
            });
        });

        it('orders newest first', async () => {
            const category = await ProductCategory.create({ categoryId: 'C2', categoryName: 'Shirts' });
            const brand = await ProductBrand.create({ brandId: 'B2', brandName: 'Nike' });
            const product = await Product.create({
                productId: 'AUD-2',
                name: 'Tee',
                category: category._id,
                brand: brand._id,
            });
            const variant = await ProductVariant.create({
                sku: 'AUD-2#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 5,
            });

            const older = await InventoryAudit.create({
                productVariant: variant._id,
                sku: variant.sku,
                type: 'increase',
                amount: 5,
                quantityBefore: 0,
                quantityAfter: 5,
                reference: 'OLD',
                updatedBy: user._id,
            });

            await new Promise((resolve) => setTimeout(resolve, 30));

            const newer = await InventoryAudit.create({
                productVariant: variant._id,
                sku: variant.sku,
                type: 'increase',
                amount: 2,
                quantityBefore: 5,
                quantityAfter: 7,
                reference: 'NEW',
                updatedBy: user._id,
            });

            const res = await chai
                .request(app)
                .get('/api/inventory-audits?page=1&limit=10')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data[0].reference).to.equal('NEW');
            expect(res.body.data[1].reference).to.equal('OLD');
            expect(newer).to.exist;
            expect(older).to.exist;
        });
    });
});
