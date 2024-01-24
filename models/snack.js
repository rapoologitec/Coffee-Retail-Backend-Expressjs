const mongoose = require('mongoose')

const snackSchema = new mongoose.Schema({

    name: {
        type:String, 
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    /* URL to the picture */
    link:{
        type:String,
        default: ""
        
    },
    detail: {
        type: String,
        default:""
    }
})

module.exports = mongoose.model('snack', snackSchema)
