const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    snackId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "snack",
    },
    
    /* not sure what to use,
       maybe include a snack name as well or 
       just use snack name as a unique identifier? 
    */
    name:{
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
})

const orderSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "vendor",
        required: true
    },
    customerId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "customer",
        required: true
    },
    created: {
        type: Date, 
        required: true,
        default: Date.now
    },
    amount: {
        // 总金额
        type: Number,
        min: 0,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['fulfilled', 'pending', 'cancelled', 'finished'],
        default: 'pending'
    },
    isDiscounted: {
        type: Boolean,
        default: false,
        required: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 0, 
        max: 5
    },
    review: {
        type:String,
        default:"",
    },
    orderItem: [itemSchema],
    givenName:{ 
        type: String,
        default:""
    },
    
})


module.exports = mongoose.model('order', orderSchema)
