const mongoose  = require('mongoose')

const Schema = mongoose.Schema;

const userSchema    = new Schema({
    emailAddress    : {
        required    : true,
        trim        : true,
        type        : String,
        unique      : true
    },
    userName    : {
        required    : true,
        type        : String
    },
    accountNumber    : {
        required    : true,
        type        : Number,
        unique      : true
    },
    identityNumber  : {
        required    : true,
        type        : Number,
        unique      : true
    },
    password    : {
        required    : false,
        type    : String,
    }
}, {
    timestamps  : true
})

const User  = mongoose.model('User', userSchema)

module.exports  = User