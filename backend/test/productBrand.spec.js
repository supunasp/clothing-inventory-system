const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const Product = require('../models/Product');
const ProductBrand = require('../models/ProductBrand');
const ProductCategory = require('../models/ProductCategory');
const { createStaffUser, createAdminUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

const seedBrand = (overrides = {}) =>
    ProductBrand.create({
        brandId: 'B-A',
        brandName: 'Nike',
        ...overrides,
    });

describe('ProductBrand endpoints', () => {
    let admin;
    let headers;

    beforeEach(async () => {
        admin = await createAdminUser();
        headers = authHeader(admin);
    });

    describe('Staff access restrictions', () => {
        let staffHeaders;

        beforeEach(async () => {
            const staff = await createStaffUser();
            staffHeaders = authHeader(staff);
        });

        it('blocks staff from creating a brand', async () => {
            const res = await chai
                .request(app)
                .post('/api/brands')
                .set(staffHeaders)
                .send({ brandId: 'STAFF-NO', brandName: 'X' });

            expect(res).to.have.status(403);
        });

        it('blocks staff from updating a brand', async () => {
            await seedBrand({ brandId: 'B-EXIST' });

            const res = await chai
                .request(app)
                .put('/api/brands/B-EXIST')
                .set(staffHeaders)
                .send({ brandName: 'X' });

            expect(res).to.have.status(403);
        });

        it('blocks staff from deleting a brand', async () => {
            await seedBrand({ brandId: 'B-EXIST-D' });

            const res = await chai
                .request(app)
                .delete('/api/brands/B-EXIST-D')
                .set(staffHeaders);

            expect(res).to.have.status(403);
        });

        it('allows staff to GET brands', async () => {
            await seedBrand({ brandId: 'B-READ' });

            const res = await chai
                .request(app)
                .get('/api/brands')
                .set(staffHeaders);

            expect(res).to.have.status(200);
        });
    });

    describe('POST /api/brands', () => {
        it('creates a brand', async () => {
            const res = await chai
                .request(app)
                .post('/api/brands')
                .set(headers)
                .send({ brandId: 'B-NEW', brandName: 'UniQlo' });

            expect(res).to.have.status(201);
            expect(res.body.brand).to.deep.include({
                brandId: 'B-NEW',
                brandName: 'UniQlo',
            });
        });

        it('rejects duplicate brandId', async () => {
            await seedBrand({ brandId: 'B-DUP' });

            const res = await chai
                .request(app)
                .post('/api/brands')
                .set(headers)
                .send({ brandId: 'B-DUP', brandName: 'Other' });

            expect(res).to.have.status(409);
        });
    });

    describe('GET /api/brands', () => {
        it('returns array when unpaginated', async () => {
            await seedBrand({ brandId: 'B-1' });
            await seedBrand({ brandId: 'B-2', brandName: 'CK' });

            const res = await chai.request(app).get('/api/brands').set(headers);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array').with.length(2);
        });

        it('paginates when query params are given', async () => {
            await seedBrand({ brandId: 'B-1' });
            await seedBrand({ brandId: 'B-2', brandName: 'CK' });

            const res = await chai
                .request(app)
                .get('/api/brands?page=1&limit=1')
                .set(headers);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.length(1);
            expect(res.body.pagination.totalItems).to.equal(2);
        });
    });

    describe('PUT /api/brands/:brandId', () => {
        it('updates the name', async () => {
            await seedBrand({ brandId: 'B-EDIT', brandName: 'Old' });

            const res = await chai
                .request(app)
                .put('/api/brands/B-EDIT')
                .set(headers)
                .send({ brandName: 'New' });

            expect(res).to.have.status(200);
            expect(res.body.brand.brandName).to.equal('New');
        });

        it('rejects when products reference the brand', async () => {
            const brand = await seedBrand({ brandId: 'B-USED' });
            const category = await ProductCategory.create({ categoryId: 'C-1', categoryName: 'Shirt' });
            await Product.create({
                productId: 'P-Brand',
                name: 'Office Shirt',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .put('/api/brands/B-USED')
                .set(headers)
                .send({ brandName: 'Renamed' });

            expect(res).to.have.status(409);
        });
    });

    describe('DELETE /api/brands/:brandId', () => {
        it('deletes when unreferenced', async () => {
            await seedBrand({ brandId: 'B-DEL' });

            const res = await chai
                .request(app)
                .delete('/api/brands/B-DEL')
                .set(headers);

            expect(res).to.have.status(200);
            const remaining = await ProductBrand.countDocuments({ brandId: 'B-DEL' });
            expect(remaining).to.equal(0);
        });

        it('rejects when products reference the brand', async () => {
            const brand = await seedBrand({ brandId: 'B-LOCKED' });
            const category = await ProductCategory.create({ categoryId: 'C-2', categoryName: 'Trouser' });
            await Product.create({
                productId: 'P-Brand-2',
                name: 'Denim',
                category: category._id,
                brand: brand._id,
            });

            const res = await chai
                .request(app)
                .delete('/api/brands/B-LOCKED')
                .set(headers);

            expect(res).to.have.status(409);
        });
    });
});
