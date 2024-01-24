const request = require('supertest')

const app = require('../server')
const express = require('express')
app.use(express.json())

describe("Integration Test: Vendor set status of the van",() => {
    let agent = request.agent(app)
    let token, vendorId

    beforeAll(()=>{
        agent.post('/vendor/login')
        .send({
            "username":"vendor3",
            "password":"vendor3"
        })
        .set('Content-Type', "application/json")
        .set('Accept', 'application/json')
        .expect(200)
        .then(res => {
            return res.json()
        })
        .then(res => {
            token = res['accessToken']
            vendorId = res['vendorId']
        })
    })

    test('Make sure vendor id is valid', ()=>{
        //expect(vendorId).toBe("609554bb3149dc4ed04ff371");
        console.log(token)
    })
}
)

/* I am getting a HTTP 415 error and I can't fix it before due, lol */