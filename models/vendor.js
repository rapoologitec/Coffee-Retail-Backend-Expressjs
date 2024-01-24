const mongoose = require('mongoose')
/* To-do */
const vendorSchema = new mongoose.Schema({

    username: {
        type:String, 
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    description: {
        /* a short message to describe the exact location? */
        type: String
    },
    isReady:{
        /* is open for business? */
        type: Boolean,
        default: false
    },
    /* vendor location */
    lat:{
        type: Number,
        required: true,
    },
    lon:{
        type: Number,
        required: true,
    },
    funName: {
        type: String,
        required: true,
    }

})

module.exports = mongoose.model('vendor', vendorSchema)
