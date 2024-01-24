const express = require('express')
require('dotenv').config()
const router = express.Router()
const Customers = require('../models/customer')
const Orders = require('../models/order')
const Tokens = require('../models/refreshToken')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {body, validationResult} = require('express-validator')

const isGoodPassword = require('../controllers/isGoodPassword.js')


const TOKEN_EXPIRE_DURATION = '2400h' // CHANGE this (in production to something like 24h or 2 days)!


/* middleware function that authenticate user's JWT in the request header */
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



// Create customer, used as customer sign up
router.post('/', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:4}),
    body('firstName').escape(),
    body('lastName').escape()],
    async (req, res) => {
        const e = validationResult(req)
        if (!e.isEmpty()) { return res.status(400).json({message: e.array()}) }

        const username = req.body.username 
        const userpw = req.body.password
        
        const userEmail = req.body.email 
        if ((username == null) || (userpw == null) || (userEmail == null)) {
            return res.status(400).json({message:"missing username/password"})
        }
        
        /* Check if the email and username already exist in the database */
        const [existUser, existEmail] = await Promise.all([
            Customers.findOne({username: username}),
            Customers.findOne({email: userEmail})
        ])

        if ((existUser != null)||(existEmail != null)) return res.status(400).json({message: "Username/Email already exists"})
        
        // check if the password is secure enough
        if (!isGoodPassword(userpw)) return res.status(400).json({message: "Insecure password"}) 
        
        try {
            // store the password hash instead of plain password
            const salt = await bcrypt.genSalt()
            const pwHash = await bcrypt.hash(req.body.password, salt)
            
            const customer = new Customers({
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                email: req.body.email,
                password: pwHash,
                username: req.body.username,
            })
            const newCustomer = await customer.save()
            res.status(201).json(newCustomer) // HTTP 201 Created
        } catch (err) {
            res.status(500).json({message:err.message})
        }
})


/* Customer can find his order at /customer/myOrders , (pass in the jwt token in header)*/
router.get('/myOrders', authenticateToken, async (req, res) => {
    try {
        const orders = await Orders.find({customerId: res.user.userId}).sort('-created')
        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

/*handle user login, if success, send user access token */
router.post('/login', 
    body('username').escape(),
    body('password').isLength({min: 4}),
    async (req, res) => {
        const e = validationResult(req)
        if (!e.isEmpty()) {return res.status(400).json({message: e.array()})}
        
        const username = req.body.username
        const userpw = req.body.password
        if ((username == null) || (userpw == null)) return res.status(401).json({message: "Username/Password Empty"})

        const c = await Customers.findOne({username: username})
        if (c == null) return res.status(400).json({message: "Login Credential Incorrect"})

        let isValidUser = false
        try {
            isValidUser = await bcrypt.compare(req.body.password, c.password)
            if (!isValidUser) return res.status(400).json({message: "Login Credential Incorrect"})
            
            /*  user is valid, send user the JWT */
            const userObj = {username: c.username, userId: c._id}
            const accessToken = jwt.sign(userObj, process.env.ACCESS_TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE_DURATION}) 
            const refreshToken = jwt.sign(userObj, process.env.REFRESH_TOKEN_SECRET)
            
            const newRefreshToken = new Tokens({
                token: refreshToken
            })

            await newRefreshToken.save()

            res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, customerId: c._id })
        } catch (err) {
            return res.status(500).json({message: err.message})
        }
})

router.post('/logout', async (req, res) => {
   const userRefreshToken = req.body.token 
   const t = await Tokens.findOne({token: userRefreshToken})

   if (t == null) return res.status(400).json({message: "Invalid Refresh Token"})

   await t.remove()
   res.status(200).json({message: "logout success"})
})


router.get('/details', authenticateToken, async (req, res) => {
    try {
        const c = await Customers.findOne({_id: res.user.userId}, {password: false, _id: false, __v: false})
        if (c == null) return res.status(400).json({message: "Invalid user"})
        return res.status(200).json(c)
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    

})



//updating one
router.post('/update', authenticateToken, async (req, res) => {
    try {

        let c = await Customers.findById(res.user.userId);
        if (req.body.firstName != null) c.firstName = req.body.firstName
        if (req.body.lastName != null)  c.lastName = req.body.lastName
        if (req.body.email != null)     c.email = req.body.email
        if (req.body.username != null)  c.username = req.body.username
        if (req.body.password != null) {
            if (!isGoodPassword(req.body.password)) { return res.status(400).json({message: "Password Insecure"}) }
            // otherwise hash the password and save it
            const salt = await bcrypt.genSalt()
            const pwHash = await bcrypt.hash(req.body.password, salt)
            c.password = pwHash    
        }

        await c.save()
        res.status(200).json({message:"success"}) 
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})



/* the midware function find the customer and put it in res.customer*/
// async function getCustomer(req, res, next) {
//     let customer
//     try {
//         customer = await Customers.findById(req.params.id)
//         if (customer == null) {
//             return res.status(404).json({ message: "Cannot find customer"})
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message })
//     }
//     res.customer = customer
//     next()
// }


module.exports = router 

