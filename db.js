const mongoose  = require('mongoose')

exports.connect = function(){
    return new Promise((resolve, reject) => {
        if(process.env.NODE_ENV === 'TEST'){
            const Mockgoose = require('mockgoose').Mockgoose;
            const mockgoose = new Mockgoose(mongoose);

            mockgoose.prepareStorage()
            .then(() => {
                mongoose.connect('mongodb://example.com/TestingDB', {
                    useNewUrlParser: true,
                    // useCreateIndex: true,
                })
                .then(() => {
                    console.log('Mockgoose connected succesfully')
                    resolve()
                })
                .catch(err => {
                    console.log('Error connectiong to Mockgoose', err)
                    reject(err)
                })
            })
        }
        else{
            mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                // useCreateIndex: true,
                // useFindAndModify: false,
                autoIndex: false, // Don't build indexes
                // poolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                family: 4, // Use IPv4, skip trying IPv6,
                connectTimeoutMS    : 1000,
                authSource  : "admin"
            })
            .then(() => {
                console.log('MongoDB connected succesfully')
                resolve()
            })
            .catch(err => {
                console.log('Error connectiong to MongoDB', err)
                reject(err)
            })
        }
    })
    
}

exports.disconnect = function(){
    return mongoose.disconnect();
}
