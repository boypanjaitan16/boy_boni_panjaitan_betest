const redis     = require('redis')
const client    = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST)

exports.cacheAllUsers = (req, res, next) => {
    client.get('all_users', (err, data) => {
        if(err) throw Error(err)

        if(data) req.cache   = data;

        next()
    })
}

exports.cacheUser = (req, res, next) => {
    client.get(`user_${req.params.id}`, (err, data) => {
        if(err) throw Error(err)

        if(data) req.cache  = data;

        next()
    })
}

exports.cacheProfile = (req, res, next) => {
    client.get(`user_${req.user.userId}`, (err, data) => {
        if(err) throw Error(err)

        if(data) req.cache  = data;

        next()
    })
}