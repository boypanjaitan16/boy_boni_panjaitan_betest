const {body, validationResult} = require('express-validator')
const {responseSuccess, responseFailed} = require('../helpers/BasicHelper')

const User = require('../models/User')

const redis     = require('redis')
const client    = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)

exports.detail = async (req, res) => {
    if(req.cache) return responseSuccess(res, JSON.parse(req.cache))

    const user  = await User.findById(req.user.userId).select({password:0})

    if(!user){
        return responseFailed(res, 'User not found')
    }

    client.setex(`user_${req.user.userId}`, 3600, JSON.stringify(user))
    return responseSuccess(res, user)
}

exports.update = async (req, res) => {
    const errors    = validationResult(req)

    if(!errors.isEmpty()){
        return responseFailed(res, errors.array());
    }

    const user  = await User.findById(req.user.userId)

    if(!user){
        return responseFailed(res, [{
            msg : 'User not found'
        }])
    }
    const {emailAddress, userName, accountNumber, identityNumber}    = req.body

    user.emailAddress   = emailAddress;
    user.userName       = userName;
    user.accountNumber  = accountNumber;
    user.identityNumber = identityNumber;

    await user.save()
    
    return responseSuccess(res, user)
}

exports.updateValidation = [
    body('emailAddress', 'Email Address is required').notEmpty().bail().isEmail()
        .withMessage('Email format is not valid')
        .bail()
        .custom((emailAddress, {req}) => {
            return User.findOne({emailAddress, _id: {$ne : req.user.userId}}).then(user => {
                if(user){
                    return Promise.reject('Email already taken')
                }
            })
        }),
    body('userName', 'User Name is required').notEmpty(),
    body('accountNumber', 'Account Number is required').notEmpty().isNumeric()
        .withMessage('Account Number must be numeric')
        .bail()
        .custom((accountNumber, {req}) => {
            return User.findOne({accountNumber, _id: {$ne: req.user.userId}}).then(user => {
                if(user){
                    return Promise.reject('User with this Account Number already exists')
                }
            })
        }),
    body('identityNumber', 'Identity Number is required').notEmpty().isNumeric()
        .withMessage('Identity Number must be numeric')
        .bail()
        .custom((identityNumber, {req}) => {
            return User.findOne({identityNumber, _id:{$ne:req.user.userId}}).then(user => {
                if(user){
                    return Promise.reject('User with this Identity Number already exists')
                }
            })
        }),

]