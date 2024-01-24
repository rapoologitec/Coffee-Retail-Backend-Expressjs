const express = require('express')
require('dotenv').config()
const router = express.Router()
const jwt = require('jsonwebtoken')

const Tokens = require('../models/refreshToken')

const TOKEN_EXPIRE_DURATION = '2400h' // CHANGE this (in production)!

router.post('/', async (req, res) => {
    const refreshToken = req.body.token 
    if (refreshToken == null) return res.status(400).json({message: "refresh token missing"})

    const c = await Tokens.findOne({token: refreshToken})
    if (c == null) return res.status(403).json({message: "Invalid Refresh Token"})

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = jwt.sign({username: user.username, userId: user.userId},
            process.env.ACCESS_TOKEN_SECRET, {expiresIn: TOKEN_EXPIRE_DURATION})

        return res.status(200).json({accessToken: accessToken})
    })



})

module.exports = router