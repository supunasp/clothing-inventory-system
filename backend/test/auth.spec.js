const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const { createStaffUser, authHeader } = require('./helpers/auth');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('creates a new user and returns a token', async () => {
            const res = await chai.request(app).post('/api/auth/register').send({
                firstName: 'Alice',
                lastName: 'Adams',
                email: 'alice@test.com',
                password: 'password123',
            });

            expect(res).to.have.status(201);
            expect(res.body).to.include({
                firstName: 'Alice',
                lastName: 'Adams',
                email: 'alice@test.com',
                role: 'staff',
                active: true,
            });
            expect(res.body.token).to.be.a('string');
            expect(res.body).to.not.have.property('password');
        });

        it('rejects a duplicate email', async () => {
            await createStaffUser({ email: 'dup@test.com' });

            const res = await chai.request(app).post('/api/auth/register').send({
                firstName: 'Bob',
                lastName: 'Brown',
                email: 'dup@test.com',
                password: 'password123',
            });

            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('returns a token for valid credentials', async () => {
            await createStaffUser({ email: 'login@test.com', password: 'password123' });

            const res = await chai.request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'password123',
            });

            expect(res).to.have.status(200);
            expect(res.body.email).to.equal('login@test.com');
            expect(res.body.token).to.be.a('string');
        });

        it('rejects invalid password', async () => {
            await createStaffUser({ email: 'login@test.com', password: 'password123' });

            const res = await chai.request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'wrong-password',
            });

            expect(res).to.have.status(401);
            expect(res.body.message).to.equal('Invalid email or password');
        });

        it('rejects unknown email', async () => {
            const res = await chai.request(app).post('/api/auth/login').send({
                email: 'nobody@test.com',
                password: 'whatever',
            });

            expect(res).to.have.status(401);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('returns the current user', async () => {
            const user = await createStaffUser({ email: 'me@test.com' });

            const res = await chai
                .request(app)
                .get('/api/auth/profile')
                .set(authHeader(user));

            expect(res).to.have.status(200);
            expect(res.body.email).to.equal('me@test.com');
            expect(res.body.firstName).to.equal('Test');
        });

        it('rejects requests without a token', async () => {
            const res = await chai.request(app).get('/api/auth/profile');

            expect(res).to.have.status(401);
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('updates editable fields', async () => {
            const user = await createStaffUser({ email: 'edit@test.com' });

            const res = await chai
                .request(app)
                .put('/api/auth/profile')
                .set(authHeader(user))
                .send({ firstName: 'Updated', lastName: 'Name' });

            expect(res).to.have.status(200);
            expect(res.body.firstName).to.equal('Updated');
            expect(res.body.lastName).to.equal('Name');
            expect(res.body.email).to.equal('edit@test.com');
        });
    });
});
