const jwt   = require('jsonwebtoken')

exports.generateAccessToken = (userId) => {
    // expires after half and hour (1800 seconds = 30 minutes)
    return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}