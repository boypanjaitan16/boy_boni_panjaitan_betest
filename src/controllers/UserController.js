const { responseSuccess, responseFailed } = require('../helpers/BasicHelper')
const {validationResult, body} = require('express-validator')
const User  = require('../models/User')

const redis     = require('redis')
const client    = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    password: process.env.REDIS_PASSWORD,
    db  : process.env.REDIS_DB
})

exports.getAllUsers = async (req, res) => {
    if(req.cache){
        return responseSuccess(res, JSON.parse(req.cache))
    }
    const users     = await User.find({}, {emailAddress: 1, userName:1, accountNumber:1, identityNumber:1})
    client.setex('all_users', 3600, JSON.stringify(users))

    return responseSuccess(res, users)
}

exports.addUser = async (req, res) => {
    const errors    = validationResult(req)

    if(!errors.isEmpty()){
        return responseFailed(res, errors.array());
    }

    const {emailAddress, userName, accountNumber, identityNumber}    = req.body

    const userModel = new User({ emailAddress, userName, accountNumber, identityNumber }) 
    const user      = await userModel.save();

    return responseSuccess(res, user);

}

exports.addUserValidation = [
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

]

exports.updateUser = async (req, res) => {
    const errors    = validationResult(req)

    if(!errors.isEmpty()){
        return responseFailed(res, errors.array());
    }

    const user  = await User.findById(req.params.id);

    if(!user){
        return responseFailed(res, [
            {
                msg     : "User not found"
            }
        ])
    }

    const {emailAddress, userName, identityNumber, accountNumber}    = req.body

    user.emailAddress   = emailAddress;
    user.userName       = userName;
    user.identityNumber = identityNumber;
    user.accountNumber  = accountNumber;

    await user.save();

    return responseSuccess(res, user);
}

exports.updateUserValidation = [
    body('emailAddress', 'Email Address is required').notEmpty().bail().isEmail()
        .withMessage('Email format is not valid')
        .bail()
        .custom((emailAddress, {req}) => {
            return User.findOne({emailAddress, _id: {$ne : req.params.id}}).then(user => {
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
            return User.findOne({accountNumber, _id: {$ne: req.params.id}}).then(user => {
                if(user){
                    return Promise.reject('User with this Account Number already exists')
                }
            })
        }),
    body('identityNumber', 'Identity Number is required').notEmpty().isNumeric()
        .withMessage('Identity Number must be numeric')
        .bail()
        .custom((identityNumber, {req}) => {
            return User.findOne({identityNumber, _id:{$ne:req.params.id}}).then(user => {
                if(user){
                    return Promise.reject('User with this Identity Number already exists')
                }
            })
        }),
]

exports.getUser = async (req, res) => {
    try{
        if(req.cache) return responseSuccess(res, JSON.parse(req.cache))

        const user  = await User.findById(req.params.id).select({password:0});
        client.setex(`user_${req.params.id}`, 3600, JSON.stringify(user))

        return responseSuccess(res, user)
    }
    catch(e){
        return responseFailed(res, [
            {msg : e.message}
        ])
    }
}

exports.getUserByIdentityNumber = async (req, res) => {
    try{
        if(req.cache) return responseSuccess(res, JSON.parse(req.cache))

        const user  = await User.findOne({identityNumber : req.params.id}).select({password:0});

        if(!user) throw new Error('User not found')

        client.setex(`user_${req.params.id}`, 3600, JSON.stringify(user))

        return responseSuccess(res, user)
    }
    catch(e){
        return responseFailed(res, [
            {msg : e.message}
        ])
    }
}

exports.getUserByAccountNumber = async (req, res) => {
    try{
        if(req.cache) return responseSuccess(res, JSON.parse(req.cache))

        const user  = await User.findOne({accountNumber : req.params.id}).select({password:0});

        if(!user) throw new Error('User not found')

        client.setex(`user_${req.params.id}`, 3600, JSON.stringify(user))

        return responseSuccess(res, user)
    }
    catch(e){
        return responseFailed(res, [
            {msg : e.message}
        ])
    }
}

exports.deleteUser = async (req, res) => {
    try{
        if(req.params.id === req.user.userId){
            return responseFailed(res, [
                {msg: 'You can not remove your own account'}
            ])
        }
        const user  = await User.remove({_id : req.params.id});

        return responseSuccess(res, user)   
    }
    catch(e){
        return responseFailed(res, [
            {
                msg: e.message
            }
        ])
    }

}