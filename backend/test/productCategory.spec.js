const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const { createStaffUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

const seedCategory = (overrides = {}) =>
    ProductCategory.create({
        categoryId: 'CAT-A',
        categoryName: 'Shirts',
        ...overrides,
    });

describe('ProductCategory endpoints', () => {
    let user;
    let headers;

    beforeEach(async () => {
        user = await createStaffUser();
        headers = authHeader(user);
    });

    describe('POST /api/categories', () => {
        it('creates a category', async () => {
            const res = await chai
                .request(app)
                .post('/api/categories')
                .set(headers)
                .send({ categoryId: 'CAT-NEW', categoryName: 'Trousers' });

            expect(res).to.have.status(201);
            expect(res.body.category).to.deep.include({
                categoryId: 'CAT-NEW',
                categoryName: 'Trousers',
            });
        });

        it('rejects duplicate categoryId', async () => {
            await seedCategory({ categoryId: 'CAT-DUP' });

            const res = await chai
                .request(app)
                .post('/api/categories')
                .set(headers)
                .send({ categoryId: 'CAT-DUP', categoryName: 'Other' });

            expect(res).to.have.status(409);
        });

        it('requires id and name', async () => {
            const res = await chai
                .request(app)
                .post('/api/categories')
                .set(headers)
                .send({ categoryId: 'CAT-X' });

            expect(res).to.have.status(400);
        });
    });

    describe('GET /api/categories', () => {
        it('returns array when unpaginated', async () => {
            await seedCategory({ categoryId: 'CAT-1' });
            await seedCategory({ categoryId: 'CAT-2', categoryName: 'T Shirts' });

            const res = await chai.request(app).get('/api/categories').set(headers);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.length(2);
        });

        it('paginates when page or limit is given', async () => {
            await seedCategory({ categoryId: 'CAT-1' });
            await seedCategory({ categoryId: 'CAT-2', categoryName: 'T Shirts' });
            await seedCategory({ categoryId: 'CAT-3', categoryName: 'Coat' });

            const res = await chai
                .request(app)
                .get('/api/categories?page=1&limit=2')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(2);
            expect(res.body.pagination).to.include({
                page: 1,
                limit: 2,
                totalItems: 3,
                totalPages: 2,
            });
        });
    });

    describe('PUT /api/categories/:categoryId', () => {
        it('updates the name', async () => {
            await seedCategory({ categoryId: 'CAT-EDIT', categoryName: 'Old' });

            const res = await chai
                .request(app)
                .put('/api/categories/CAT-EDIT')
                .set(headers)
                .send({ categoryName: 'New' });

            expect(res).to.have.status(200);
            expect(res.body.category.categoryName).to.equal('New');
        });

        it('rejects when products reference the category', async () => {
            const category = await seedCategory({ categoryId: 'CAT-USED' });
            const brand = await ProductBrand.create({ brandId: 'B-1', brandName: 'Nike' });
            await Product.create({
                productId: 'P-1',
                name: 'Office Shirt',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .put('/api/categories/CAT-USED')
                .set(headers)
                .send({ categoryName: 'Renamed' });

            expect(res).to.have.status(409);
            expect(res.body.message).to.match(/product\(s\) reference it/);
        });
    });

    describe('DELETE /api/categories/:categoryId', () => {
        it('deletes when unreferenced', async () => {
            await seedCategory({ categoryId: 'CAT-DEL' });

            const res = await chai
                .request(app)
                .delete('/api/categories/CAT-DEL')
                .set(headers);

            expect(res).to.have.status(200);
            const remaining = await ProductCategory.countDocuments({ categoryId: 'CAT-DEL' });
            expect(remaining).to.equal(0);
        });

        it('rejects when products reference the category', async () => {
            const category = await seedCategory({ categoryId: 'CAT-LOCKED' });
            const brand = await ProductBrand.create({ brandId: 'B-2', brandName: 'CK' });
            await Product.create({
                productId: 'P-2',
                name: 'Denim',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .delete('/api/categories/CAT-LOCKED')
                .set(headers);

            expect(res).to.have.status(409);
        });
    });
});
