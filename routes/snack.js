const express = require('express')

const router = express.Router()
const Snacks = require('../models/snack')

async function getSnack(req, res, next) {
    let snack
    try {
        snack = await Snacks.findOne({name: req.params.name})
        if (snack == null) {
            return res.status(404).json({message:"Cannot find the snack"})
        }
        res.snack = snack
        
    } catch (err) {
        res.status(500).json({message:err.message})
    }
    next()
}

//get all snack
router.get('/', async (req, res) => {
    try {
        const snacks = await Snacks.find()
        res.status(200).json(snacks)
    } catch (err) {
        res.status(500).json({err: err.message})
    }
})

// get one snack (by name)
router.get('/:name', getSnack, async (req, res) => {
    try {
        res.status(200).json(res.snack)
    } catch (err) {
        res.status(500).json({err: err.message})
    }
})



module.exports = router
