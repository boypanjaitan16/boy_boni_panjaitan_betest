process.env.NODE_ENV    = 'TEST';

const expect    = require('chai').expect;
const request   = require('supertest')
const app       = require('../bin/app_test')
const db        = require('../db')

let token;

describe('Profile Endpoints', () => {
    before((done) => {
        db.connect()
        .then(() => {
            request(app)
            .post('/auth/sign-in')
            .send({
                emailAddress    : 'admin@website.com',
                password    : '12345678'
            })
            .end((error, response) => {
                token   = response.body.token;
                done();
            })
        })
        .catch((err) => done(err));
    })

    after((done) => {
        db.disconnect()
        .then(() => done())
        .catch((err) => done(err));
    })

    describe('GET /profile',() => {
        it('Successful to get detail profile of current request', (done) => {
            request(app)
            .get('/profile')
            .set({ Authorization : `Bearer ${token}`})
            .end((error, response) => {
                expect(response.status).equal(200)
                expect(response.body).to.be.a('object')
                expect(response.body).to.contain.property('emailAddress')
                expect(response.body).to.contain.property('userName')
                expect(response.body).to.contain.property('identityNumber')
                expect(response.body).to.contain.property('accountNumber')
                expect(response.body).to.not.contain.property('password')
                done()
            })
        })

        it('Failed to get detail profile of current request due to missing/wrong Auth token', (done) => {
            request(app)
            .get('/profile')
            .set({Authorization : `Bearer --something`})
            .end((error, {body, status}) => {
                expect(status).equal(401)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('code')
                done()
            })
        })
    })

    describe('POST /profile', () => {
        it('Successful to update profile', (done) => {
            request(app)
            .post('/profile')
            .set({ Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'somewhat@gmail.com',
                userName        : 'Username',
                identityNumber  : '12345678',
                accountNumber   : '12345678'
            })
            .end((error, {body, status}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')

                done()
            })
        })

        it('Failed to update profile due to missing/wrong Auth token', (done) => {
            request(app)
            .post('/profile')
            .set({Authorization : `Bearer --something`})
            .send({
                emailAddress    : 'somewhat@gmail.com',
                userName        : 'Username',
                identityNumber  : '12345678',
                accountNumber   : '12345678'
            })
            .end((errors, {status, body}) => {
                expect(status).equal(401);
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                done();
            })
        })

        it('Failed to update profile due to missing field(s)', (done) => {
            request(app)
            .post('/profile')
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'somewhat@gmail.com',
                userName        : 'Username',
                // identityNumber  : '12345678',
                // accountNumber   : '12345678'
            })
            .end((errors, {status, body}) => {
                expect(status).equal(403);
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                done();
            })
        })
    })
})