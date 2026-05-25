const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const ProductVariant = require('../models/ProductVariant');
const User = require('../models/User');
const { createStaffUser, createAdminUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

describe('Admin endpoints', () => {
    let admin;
    let headers;

    beforeEach(async () => {
        admin = await createAdminUser();
        headers = authHeader(admin);
    });

    describe('GET /api/admin/analytics', () => {
        it('returns counts that reflect current data', async () => {
            const category = await ProductCategory.create({ categoryId: 'A-C', categoryName: 'Shirts' });
            const brand = await ProductBrand.create({ brandId: 'A-B', brandName: 'Nike' });
            const product = await Product.create({
                productId: 'A-P',
                name: 'Tee',
                category: category._id,
                brand: brand._id,
            });
            await ProductVariant.create({
                sku: 'A-P#Blue#M',
                product: product._id,
                color: 'Blue',
                size: 'M',
                stockAmount: 12,
            });
            await ProductVariant.create({
                sku: 'A-P#Red#S',
                product: product._id,
                color: 'Red',
                size: 'S',
                stockAmount: 0,
            });

            const res = await chai
                .request(app)
                .get('/api/admin/analytics')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body).to.include({
                totalProducts: 1,
                totalCategories: 1,
                totalBrands: 1,
                totalUsers: 1,
                totalStock: 12,
                outOfStockProducts: 1,
            });
        });
    });

    describe('GET /api/admin/users', () => {
        it('lists users paginated and filtered by role', async () => {
            await createStaffUser({ email: 'staff1@test.com' });
            await createStaffUser({ email: 'staff2@test.com' });

            const res = await chai
                .request(app)
                .get('/api/admin/users?page=1&limit=10&role=staff')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(2);
            expect(res.body.data.every((u) => u.role === 'staff')).to.equal(true);
        });

        it('filters by search', async () => {
            await createStaffUser({ firstName: 'Alice', email: 'alice@test.com' });
            await createStaffUser({ firstName: 'Bob', email: 'bob@test.com' });

            const res = await chai
                .request(app)
                .get('/api/admin/users?page=1&limit=10&search=alice')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(1);
            expect(res.body.data[0].email).to.equal('alice@test.com');
        });
    });

    describe('PUT /api/admin/users/:id/status', () => {
        it('deactivates a different user', async () => {
            const target = await createStaffUser({ email: 'target@test.com' });

            const res = await chai
                .request(app)
                .put(`/api/admin/users/${target._id}/status`)
                .set(headers)
                .send({ active: false });

            expect(res).to.have.status(200);
            expect(res.body.user.active).to.equal(false);
        });

        it('rejects deactivating self', async () => {
            const res = await chai
                .request(app)
                .put(`/api/admin/users/${admin._id}/status`)
                .set(headers)
                .send({ active: false });

            expect(res).to.have.status(400);
        });

        it('rejects non-boolean active value', async () => {
            const target = await createStaffUser({ email: 'target2@test.com' });

            const res = await chai
                .request(app)
                .put(`/api/admin/users/${target._id}/status`)
                .set(headers)
                .send({ active: 'yes' });

            expect(res).to.have.status(400);
        });
    });

    describe('PUT /api/admin/users/:id/role', () => {
        it('updates role to admin', async () => {
            const target = await createStaffUser({ email: 'promote@test.com' });

            const res = await chai
                .request(app)
                .put(`/api/admin/users/${target._id}/role`)
                .set(headers)
                .send({ role: 'admin' });

            expect(res).to.have.status(200);
            expect(res.body.user.role).to.equal('admin');
        });

        it('rejects invalid role', async () => {
            const target = await createStaffUser({ email: 'badrole@test.com' });

            const res = await chai
                .request(app)
                .put(`/api/admin/users/${target._id}/role`)
                .set(headers)
                .send({ role: 'super' });

            expect(res).to.have.status(400);
        });

        it('rejects demoting self', async () => {
            const res = await chai
                .request(app)
                .put(`/api/admin/users/${admin._id}/role`)
                .set(headers)
                .send({ role: 'staff' });

            expect(res).to.have.status(400);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('deletes a different user', async () => {
            const target = await createStaffUser({ email: 'delme@test.com' });

            const res = await chai
                .request(app)
                .delete(`/api/admin/users/${target._id}`)
                .set(headers);

            expect(res).to.have.status(200);
            const stillThere = await User.findById(target._id);
            expect(stillThere).to.equal(null);
        });

        it('rejects deleting self', async () => {
            const res = await chai
                .request(app)
                .delete(`/api/admin/users/${admin._id}`)
                .set(headers);

            expect(res).to.have.status(400);
        });
    });
});
