process.env.NODE_ENV    = 'TEST';

const expect    = require('chai').expect;
const app       = require('../bin/app_test')
const db        = require('../db')
const request   = require('supertest')

let token;
let createdUserId;
let createdAccountNumber;
let createdIdentityNumber;
let currentUserId;

describe('Users Endpoint', () => {
    before((done) => {
        db.connect()
        .then(() => {
            request(app)
            .post('/auth/sign-in')
            .send({
                emailAddress    : 'somewhat@gmail.com',
                password        : '12345678',
            })
            .end((error, response) => {
                token   = response.body.token;
                currentUserId   = response.body.user._id;
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

    describe('GET /users', () => {
        
        it('Successful to get all users', (done) => {
            request(app)
            .get('/users')
            .set({Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.an('array')

                done()
            })
        })
        it('Failed to get all users due to missing/wrong Auth token', (done) => {
            request(app)
            .get('/users')
            .set({Authorization : `Bearer --token`})
            .end((error, {status, body}) => {
                expect(status).equal(401)
                expect(body).to.be.an('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')

                done()
            })
        })
    })

    describe('POST /users', () => {
        it('Successfull add new user', (done) => {
            request(app)
            .post('/users')
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@mail.com',
                userName        : 'username',
                identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('_id')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')
                expect(body).to.not.contain.property('password')

                createdUserId = body._id;
                createdAccountNumber    = body.accountNumber;
                createdIdentityNumber   = body.identityNumber;
                done()
            })
        })

        it('Failed to add new user due to missing field(s)', (done) => {
            request(app)
            .post('/users')
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@mail.com',
                userName        : 'username',
                // identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })

        it('Failed to add new user due to email malformat', (done) => {
            request(app)
            .post('/users')
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@com',
                userName        : 'username',
                // identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })

        it('Failed to add new user due to duplicated field(s) value', (done) => {
            request(app)
            .post('/users')
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@mail.com',
                userName        : 'username',
                identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })
    })

    describe('PUT /users/:id', () => {
        it('Successfull update a user', (done) => {
            request(app)
            .put(`/users/${createdUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@mail.com',
                userName        : 'username edit',
                identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('_id')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')
                expect(body).to.not.contain.property('password')

                done()
            })
        })

        it('Failed to update user due to missing field(s)', (done) => {
            request(app)
            .put(`/users/${createdUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@mail.com',
                userName        : 'username',
                // identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })

        it('Failed to update user due to email malformat', (done) => {
            request(app)
            .put(`/users/${createdUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'user@com',
                userName        : 'username',
                // identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })

        it('Failed to add new user due to duplicated field(s) value', (done) => {
            request(app)
            .put(`/users/${createdUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .send({
                emailAddress    : 'somewhat@gmail.com', //this is duplicated one
                userName        : 'username',
                identityNumber  : '1234567890',
                accountNumber   : '1234567890'
            })
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                expect(body).to.contain.property('errors')

                done()
            })
        })
    })

    describe('GET /users/:id', () => {
        it('Success get detail of user', (done) => {
            request(app)
            .get(`/users/${createdUserId}`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')
                expect(body).to.not.contain.property('password')

                done()
            })
        })

        it('Failed to get detail of user due to not-existing user', (done) => {
            request(app)
            .get(`/users/12345678`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')

                done()
            })
        })
    })

    describe('GET /users/identity-number/:id', () => {
        it('Success get detail of user', (done) => {
            request(app)
            .get(`/users/identity-number/${createdIdentityNumber}`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')
                expect(body).to.not.contain.property('password')

                done()
            })
        })

        it('Failed to get detail of user due to not-existing user', (done) => {
            request(app)
            .get(`/users/identity-number/xxxxxx`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')

                done()
            })
        })
    })

    describe('GET /users/account-number/:id', () => {
        it('Success get detail of user', (done) => {
            request(app)
            .get(`/users/account-number/${createdAccountNumber}`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(200)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('userName')
                expect(body).to.contain.property('emailAddress')
                expect(body).to.contain.property('identityNumber')
                expect(body).to.contain.property('accountNumber')
                expect(body).to.not.contain.property('password')

                done()
            })
        })

        it('Failed to get detail of user due to not-existing user', (done) => {
            request(app)
            .get(`/users/account-number/xxxxxx`)
            .set({ Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')

                done()
            })
        })
    })

    describe('DELETE /users/:id', () => {
        it('Successful delete user', (done) => {
            request(app)
            .delete(`/users/${createdUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(200)
                done()
            })
        })
        it('Failed to delete user due to non-existing user', (done) => {
            request(app)
            .delete(`/users/12345678`)
            .set({Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                done()
            })
        })
        it('Failed to delete user due to deleting itself', (done) => {
            request(app)
            .delete(`/users/${currentUserId}`)
            .set({Authorization : `Bearer ${token}`})
            .end((error, {status, body}) => {
                expect(status).equal(403)
                expect(body).to.be.a('object')
                expect(body).to.contain.property('code')
                expect(body).to.contain.property('message')
                done()
            })
        })
    })
})