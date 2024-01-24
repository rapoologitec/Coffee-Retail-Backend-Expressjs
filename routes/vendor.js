const express = require('express')

const router = express.Router()
const Vendors = require('../models/vendor')
const Orders = require('../models/order')
const Customers = require('../models/customer')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const TOKEN_EXPIRE_DURATION = '2400h' // CHANGE this (in production to something like 24h or 2 days)!


function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({message: "Token missing"})
    
    /* verify that token, and attatch the user so that we can reference by res.user */
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: "Invalid Token"})
 
        res.user = user
        next()
    })
}

// /* the midware function find the vendor by its _id and so we can ref by res.vendor */
// async function getVendor(req, res, next) {
//     let vendor
//     try {
//         vendor = await Vendors.findById(req.params.id)
//         if (vendor == null) {
//             return res.status(404).json({ message: "Cannot find the vendor"})
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message })
//     }
//     res.vendor = vendor
//     next()
// }


// Getting a list of vendors 
router.get('/', async (req, res) => {
    try {
        const vendors = await Vendors.find({isReady: true}, {password: false})
        res.json(vendors)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//getting all the pending orders related to this vendor
router.get('/pendingOrders', authenticateToken, async (req, res) => {
    try {
        /* send vendor all the pending orders  */
        const pendingOrders = await Orders.find({
            vendorId: res.user.userId, status: "pending"
        })

        res.status(200).json(pendingOrders)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
})


router.get('/fulfilledOrders', authenticateToken, async (req, res) => {
    try {
        /* send vendor all the pending orders  */
        const fulfilledOrders = await Orders.find({
            vendorId: res.user.userId, status: "fulfilled"
        }).sort('-created')

        res.status(200).json(fulfilledOrders)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
})


router.get('/allOrders', authenticateToken, async (req, res) => {
    try {
        /* Send the vendor all the orders in descending order of date */
        const allOrders = await Orders.find({
            vendorId: res.user.userId
        }).sort('-created')

        res.status(200).json(allOrders)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
})


// create vendor
router.post('/', async (req, res) => {
    /* These are largely the same code as the one in customer route, ommited some(unnecessary) check */
    const vendorUsername = req.body.username
    const vendorPassword = req.body.password

    if ((vendorUsername == null)||(vendorPassword == null)) return res.status(400).json({message: "Missing Username/Password"})
    
    try {
        const s = await bcrypt.genSalt()
        const pwHash = await bcrypt.hash(vendorPassword, s)

        const vendor = new Vendors({
        password: pwHash,
        username: vendorUsername,
        description: req.body.description,
        isReady: req.body.isReady,
        lat: req.body.lat,
        lon: req.body.lon,
        funName: req.body.funName
        })
    
        const newVendor = await vendor.save()
        res.status(201).json(newVendor) // HTTP 201 Created
    } catch (err) {
        res.status(500).json({message:err.message})
    }
})

// responsible for vendor login
router.post('/login', async (req, res) => {
     /* These are largely the same as the one in customer route */
    const username = req.body.username
    const userpw = req.body.password
    if ((username == null) || (userpw == null)) return res.status(401).json({message: "Username/Password Empty"})
    const v = await Vendors.findOne({username: req.body.username})
    if (v == null) return res.status(400).json({message: "Login Credential Incorrect"})
    
    try {
        const valid = await bcrypt.compare(userpw, v.password)
        if (!valid) return res.status(403).json({message: "Login Credential Incorrect"})

        const vendorObj = {username: v.username, userId: v._id}
        const accessToken = jwt.sign(vendorObj, process.env.ACCESS_TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE_DURATION}) 
        
        res.status(200).json({accessToken: accessToken, vendorId: v._id})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

})

/* this route is responsible for modifying vendor status, vendor need 
  to send a valid jwt token in the request header */
router.patch('/', authenticateToken, async (req, res) => {
    const v = await Vendors.findOne({username: res.user.username}, {password:false})
    if (v == null) return res.status(404).json({message: "Cannot find vendor"})

    if (req.body.description != null) v.description = req.body.description
    if (req.body.isReady != null)     v.isReady = req.body.isReady
    if (req.body.lat != null)         v.lat = req.body.lat
    if (req.body.lon != null)         v.lon = req.body.lon
    if (req.body.funName != null)     v.funName = req.body.funName
    /* No modifying vendor username and password, for now */

    try {
        const updatedVendor = await v.save()
        res.status(200).json(updatedVendor)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

module.exports = router
