const {body, validationResult} = require('express-validator')
const {responseError, responseSuccess, responseFailed} = require('../helpers/BasicHelper')
const {generateAccessToken} = require('../helpers/AuthHelper')

const User      = require('../models/User')
const bycript   = require('bcryptjs');

exports.login = async (req, res) => {
    try{
        const errors    = validationResult(req)

        if(!errors.isEmpty()){
            responseFailed(res, errors.array())
            return;
        }
        
        const {emailAddress, password}  = req.body
        const user  = await User.findOne({ emailAddress })

        if(!user){
            throw new Error('Sorry, we can\'t find an user with this credential {ERR_CODE:1}')
        }

        const matched   = await bycript.compare(password, user.password ?? '');

        if(matched === false){
            throw new Error('Sorry, we can\'t find an user with this credential {ERR_CODE:2}')
        }

        responseSuccess(res, {
            token   : generateAccessToken(user.id),
            user
        })
    }
    catch(err){
        responseError(res, err)
    }
}

exports.loginValidation = [
    body('emailAddress', 'Email is required').notEmpty().bail().isEmail().withMessage('Email format is not valid'),
    body('password', 'Password required').notEmpty()
]

exports.register = async (req, res) => {
    try{
        const errors    = validationResult(req)

        if(!errors.isEmpty()){
            responseFailed(res, errors.array())
            return;
        }

        const {emailAddress, userName, accountNumber, identityNumber, password}    = req.body

        const hashedPassword    = await bycript.hash(password, 10)
        const userModel         = new User({ emailAddress, userName, accountNumber, identityNumber, password : hashedPassword }) 

        const user  = await userModel.save();
        
        responseSuccess(res, {
            token   : generateAccessToken(userModel.id),
            user
        })
    }
    catch(err){
        responseError(res, err)
    }
}

exports.registerValidation = [
    body('emailAddress', 'Email Address is required').notEmpty().bail().isEmail()
        .withMessage('Email format is not valid')
        .bail()
        .custom(emailAddress => {
            return User.findOne({emailAddress}).then(user => {
                if(user){
                    return Promise.reject('Email already taken')
                }
            })
        }),
    body('userName', 'User Name is required').notEmpty(),
    body('accountNumber', 'Account Number is required').notEmpty().isNumeric()
        .withMessage('Account Number must be numeric')
        .bail()
        .custom(accountNumber => {
            return User.findOne({accountNumber}).then(user => {
                if(user){
                    return Promise.reject('User with this Account Number already exists')
                }
            })
        }),
    body('identityNumber', 'Identity Number is required').notEmpty().isNumeric()
        .withMessage('Identity Number must be numeric')
        .bail()
        .custom(identityNumber => {
            return User.findOne({identityNumber}).then(user => {
                if(user){
                    return Promise.reject('User with this Identity Number already exists')
                }
            })
        }),
    body('password', 'Password is required').notEmpty().isLength({min: 6}).bail().withMessage('Password need to be six or more chars'),
    body('password_confirmation', 'Password Confirmation is required').notEmpty().bail().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation is incorrect');
        }
        return true
    })

]