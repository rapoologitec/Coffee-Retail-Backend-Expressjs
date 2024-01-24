const mongoose = require('mongoose')

// const indivOrderSchema = new mongoose.Schema({
//     orderId: {
//         type:mongoose.Schema.Types.ObjectId,
//         ref: 'order'
//     }
// })


const customerSchema = new mongoose.Schema({

    firstName: {
        type: String,
    },
    lastName: {
        type:String, 
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    username: {
        type:String, 
        required: true,
        unique: true 
    }, 
    password: {
        type: String, 
        required: true
    },
})

module.exports = mongoose.model('customer', customerSchema)

