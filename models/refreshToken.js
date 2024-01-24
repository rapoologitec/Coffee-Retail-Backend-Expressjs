const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    token:{
        required: true,
        type: String
    }
})

module.exports = mongoose.model('refreshToken', refreshTokenSchema)
