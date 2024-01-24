const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
require('dotenv').config()

const cors = require('cors')
app.use(cors())

const port = process.env.PORT || 8000 // Change the port here

const localConnectionURL = "mongodb://localhost:27017/webapp"

const connectionURL = process.env.connectionURL || localConnectionURL


mongoose.connect(connectionURL, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex: true, 
        dbName: 'webapp'
    }
)


const db = mongoose.connection 
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('[Info]: Connected to database'))


// Customer route
const customerRouter = require('./routes/customer')
app.use('/customer', customerRouter)

// order route
const orderRouter = require('./routes/order')
app.use('/order', orderRouter)

// snacks route
const snackRouter = require('./routes/snack')
app.use('/snack', snackRouter)

// vendor route
const vendorRouter = require('./routes/vendor')
app.use('/vendor', vendorRouter)

// /token route, for refresh token
const tokenRouter = require('./routes/token')
app.use('/token', tokenRouter)


app.listen(port, () => { 
    console.log(`[Info]: Server listening at port ${port}`)
})

module.exports = app