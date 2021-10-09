process.env.NODE_ENV    = 'TEST';

const expect    = require('chai').expect;
const request   = require('supertest')
const app       = require('../bin/app_test')
const db        = require('../db')

describe('Auth Endpoints', () => {
    before((done) => {
        db.connect()
        .then(() => done())
        .catch((err) => done(err));
    })

    after((done) => {
        db.disconnect()
        .then(() => done())
        .catch((err) => done(err));
    })

    describe('POST /auth/register', () => {
        it('Successful register', (done) => {
            request(app)
            .post('/auth/register')
            .send({
                emailAddress    : 'admin@website.com',
                userName        : 'Testing',
                identityNumber  : '12345678',
                accountNumber   : '12345678',
                password        : '12345678',
                password_confirmation   : '12345678'
            })
            .end((error, res) => {
                expect(res.status).equal(200)
                expect(res.body).to.be.a('object')
                expect(res.body).to.contain.property('token')
                expect(res.body).to.contain.property('user')

                done()
            })
        })

        it('Failed register due to missing fields', (done) => {
            request(app)
            .post('/auth/register')
            .send({
                emailAddress    : 'test@mail.com',
                userName        : 'Testing',
                // identityNumber  : '12345678',
                // accountNumber   : '121425334',
                password        : '12345678'
            })
            .end((error, res) => {
                expect(res.status).equal(403)
                expect(res.body).to.be.a('object')
                expect(res.body).to.contain.property('message')
                expect(res.body).to.contain.property('errors')

                done()
            })
            
        })

        it('Failed register due to duplicated record', (done) => {
            
            request(app)
            .post('/auth/register')
            .send({
                emailAddress    : 'admin@website.com',
                userName        : 'Testing',
                identityNumber  : '12345678',
                accountNumber   : '121425334',
                password        : '12345678',
                password_confirmation   : '12345678'
            })
            .end((error, res) => {
                expect(res.status).equal(403)
                expect(res.body).to.be.a('object')
                expect(res.body).to.contain.property('message')
                expect(res.body).to.contain.property('errors')
                done()
            })
        })
    })

    //Login
    describe('POST /auth/sign-in', () => {
        it('Successful login', (done) => {
            request(app)
            .post('/auth/sign-in')
            .send({
                emailAddress    : 'admin@website.com',
                password    : '12345678'
            })
            .end((error, response) => {
                expect(response.status).equal(200);
                expect(response.body).to.be.a('object');
                expect(response.body).to.contain.property('user');
                expect(response.body).to.contain.property('token');

                done();
            })
        })

        it('Failed login due to invalid email and/or password', (done) => {
            request(app)
            .post('/auth/sign-in')
            .send({
                emailAddress    : 'test@website.com',
                password    : '12345678'
            })
            .end((error, response) => {
                expect(response.status).equal(403);
                expect(response.body).to.be.a('object');
                expect(response.body).to.contain.property('message');

                done();
            })
        })
    })
})