const express = require('express')

const router = express.Router()
const Orders = require('../models/order')
const Customers = require('../models/customer')
const Vendors = require('../models/vendor')
const Snacks = require('../models/snack')

const jwt = require('jsonwebtoken')

const {body, validationResult } = require('express-validator')

const TEN_MINUTES = 1000*600 // 1000ms * 600 sec 


function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({message: "Token missing"})
    
    /* verify that token, and attatch the user so that we can reference by res.user */
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: "Invalid Token"})
        // this midware is not responsible for checking if customerId match the userid inside jsonwebtoken 
        res.user = user
        next()
    })
}

/* the midware function that find the order by its _id so we can reference by res.order */ 
async function getOrder(req, res, next) {
    let order
    try {
        order = await Orders.findById(req.params.id)
        if (order == null) {
            return res.status(404).json({message: "Cannot find order"})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.order = order 
    next()
}

/* The midware function to validate order */
async function validateOrder(req, res, next) {
    if (req.body.orderItem == null) return res.status(400).json({message: "where is orderItem?"})
    const items = req.body.orderItem 
    const amt = req.body.amount 
    const precision = 0.005 /* To deal with JS's problematic floating number */
    
    /* If the orderItem is empty, reject it */
    if (items.length === 0) return res.status(400).json({message: "Empty Order"})

    try {
        /* To make sure customer and vendor exists */
        const [v, offeredSnacks] = await Promise.all([ 
            Vendors.findById(req.body.vendorId),
            Snacks.find({})
        ])

        if (v === null) return res.status(400).json({message: "Invalid Customer/Vendor"})
    
        /* build a lookup table */
        let m = new Map()
        for (let i=0; i < offeredSnacks.length; i++){
            m.set(offeredSnacks[i].name, offeredSnacks[i].price)
        }

        /* Validate the total price and make sure the item exists */
        let total = 0
        let currSnack;
        for (let i=0; i < items.length; i++){
            currSnack = items[i]
            if (!m.has(currSnack.name)) return res.status(400).json({message: "Invalid Snack"})

            total += m.get(currSnack.name) * currSnack.qty
        }

        if (Math.abs(total - amt) > precision) return res.status(400).json({message: "Amount Incorrect"})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    next() // call the next function
}



// create an order 
router.post('/', validateOrder, authenticateToken, async (req, res) => {
    //if (res.user.userId != req.body.customerId) return res.status(403).json({message: "Token does not match customerId"})

    try {
        const c = await Customers.findById(res.user.userId)

        const order = new Orders({
            amount:req.body.amount,
            customerId: res.user.userId,
            vendorId : req.body.vendorId,
            orderItem: req.body.orderItem,
            givenName: c.firstName
        })

        const newOrder = await order.save()
        res.status(201).json(newOrder)
        
    } catch (err) {
        return res.status(500).json({message: err.message})
    }   
    
})

router.patch('/:id', getOrder, 
    authenticateToken,
    body('review').escape(), 
    async (req, res) => {
        const e = validationResult(req)
        if (!e.isEmpty()) { return res.status(400).json({message: e.array()}) }

        let customerModifing = (res.user.userId == res.order.customerId) ? true: false
        let vendorModifing = (res.user.userId == res.order.vendorId) ? true: false 
        
        if ((!customerModifing) && (!vendorModifing)) {
            // Note: if we use the strict equality operator !== then it breaks,(Probably because customerId, vendorId is of type ObjectId)
            return res.status(401).json({message: "Cannot modify order: Token and order doesn't match"})
        }

        /* If exceed 10 minutes, then customer should not be able to modify his order item */
        const n = new Date()
        const c = new Date(res.order.created)

        let customerCanModifyOrder = ((n.getTime() - c.getTime()) <= TEN_MINUTES) ? true: false

        try {
            let modifiedOrderItem = false
            /* Otherwise user can modify his order */
            if (req.body.orderItem != null && req.body.orderItem.length != 0) {
                if ((customerModifing) && !customerCanModifyOrder) return res.status(400).json({
                    message:"Cannot modify order, 10 minutes has been passed"
                })
                
                if ((customerModifing && customerCanModifyOrder) || vendorModifing){
                    res.order.orderItem = req.body.orderItem
                    modifiedOrderItem = true
                }
            }
            // only vendor can modify these two
            if (vendorModifing){
                if (req.body.isDiscounted != null) res.order.isDiscounted = req.body.isDiscounted
                if (req.body.status != null)       res.order.status = req.body.status
            }
            
            // only customer can modify these
            if (customerModifing){
                if (req.body.rating != null)  res.order.rating = req.body.rating
                if (req.body.review != null)  res.order.review = req.body.review
                if (req.body.status != null)       res.order.status = req.body.status
            }

            /* if customer or vendor modify the order item, need to validate the order again */
            if (modifiedOrderItem){
                const items = res.order.orderItem

                if (items == null) { return res.status(400).json({message: "Item Missing"}) }
                offeredSnacks = await Snacks.find({})

                /* build a lookup table */
                let m = new Map()
                for (let i=0; i < offeredSnacks.length; i++){
                    m.set(offeredSnacks[i].name, offeredSnacks[i].price)
                }

                /* Validate the total price and make sure the item exists */
                let total = 0
                let currSnack;
                for (let i=0; i < items.length; i++){
                    currSnack = items[i]
                    if (!m.has(currSnack.name)) return res.status(400).json({message: "Cannot modify order: Invalid Snack"})

                    total += m.get(currSnack.name) * currSnack.qty
                }
                // calculate price on server side
                res.order.amount = total
            }

        // if reach this point, order is valid
            const updatedOrder = await res.order.save()
            res.status(200).json(updatedOrder) // probably change this to status 204?
        } catch (err) {
            res.status(500).json({message: err.message})
        }
})


module.exports = router 

