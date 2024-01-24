## Run server
1. Install dependecies `npm install`
2. Create a `.env` file in project root directory
3. we use JWT to authenticate user, so copy and paste the following to `.env` 

    connectionURL = "mongodb+srv://userWIT:somePassword@cluster0.v20k5.mongodb.net/cluster0?retryWrites=true&w=majority"
    ACCESS_TOKEN_SECRET = 12a2107c9ef61f57b8541535ef435a6d27531d64edb9034e0851b8bd01fc7cfc025dc5819360dc1642ba19dc16344a37a2293a8ffe638310430f0a9ee0ab9bc1
    REFRESH_TOKEN_SECRET = 30717361be51b4c3ee053b8bf70f501ec6f184caed9f018102e7bf50fc286148cf7e07b50c0a8e2f6227a457c0c38463105d0ee9e05497473eee652194a8af5f

You can also set up a local dev environment, remove the line `connectionURL = ...` above (and adjust port setting in `server.js`)

4. To run server: `npm run devstart`


## !IMPORTANT
Some adblocker block the item picture from unsplash, and please make sure the adblocker is not blocking and the `local storage` is CLEAN when testing!
### To Create a Vendor
vendor's password is hashed as well so to create one, use our hidden api, using `POST` at `/vendor`
Example


    {
    "isReady": true,
    "username": "newvendor",
	  "password":"newvendor",
    "lat": 123.456,
    "lon": 45.567,
    "description": "This is a description",
    "funName": This is a fun name"
  }
  

### sample test users
Note that we create these test users before the password requirements, the password requirements are implemented **for customer** i.e. there is a password strength check for customer
For vendor: 1) username:`testvendor`, password: `testvendor`, 2) username:`vendor3`, password: `vendor3` and 3) username:`vendor5`, password: `vendor5`
For user:   1) username: `hello`, password: `hello` or just signup. 


### Password policy
Password policy has changed, new user must have a secure password

### Customer Signup
use `POST` method on `/customer`, pass in information in request body in JSON 

### getting customer details
use `GET` on `/customer/details`, attach accessToken in request header

### Customer modify details 
use `POST` on `/customer/update`, attach access token in request header


### Login Overview
pass `username` and `password` in request body to route `/customer/login`, if the credential is correct,
the server will send back an access token and a refresh token. Client should store these two token in 
`localStorage` and access his/her order by requesting a `GET` on route: `/customer/myOrders` with `Bearer <JWT Access token>` in the request header


### Access token will expire 
User can renew his access token by making a `POST` request to `/token`, pass `refreshToken` in the request body

    {
        "token":"<replace_with_refresh_token>"
    }
if succesful, the server will send back a new access token.



---
Note: Currently the frontend does not implement any functionality to renew this refreshToken, current setting for expiration is 100 days

### Create an Order
use `POST` on route `/order`, pass in Customer's access token in the request header and relavant information in the request body in JSON, 

#### Examples
**corresponding** user `hello` and vendor `vendor3`, both customer and vendorId must be valid otherwise server will reject this order
Note: server will infer customerId from the accessToken

    {
    "amount": 22,
    "vendorId": "609554bb3149dc4ed04ff371",
    "orderItem": [
      {
        "qty": 2,
        "name": "Latte"
      },
      {
        "qty": 2,
        "name": "Small Cake"
      },
      {
        "qty": 2,
        "name": "Plain Biscuit"
      }
    ]
  }




### Modifying an existing order 
use `PATCH` on route `/order/<order_id>`, pass in access token in request header and the info needed to modify the order in request body, customer and vendor relevant to a particular order can both use this route to modify the order

#### Example

    use URL `/order/60abaa21a7dc0c555c5585b9`, embed access token in header and in the request body:
        {
          "orderItem": [
            {
              "qty": 1,
              "name": "Latte"
            }
          ]
        }

### Logout overview
user can logout by making a  `POST` request to `/customer/logout`, the request body should include its refresh token in JSON
    
    {
        "token": <replace_with_refreshToken>
    }

if successful, server will delete the refreshToken from database so that refreshToken become invalid

### Getting all the order related to a customer
Use `GET` on route `/customer/myOrders`, include the access token in the request header.

### Getting pending/all order related to a vendor
Use `GET` on `/vendor/pendingOrders` and `/vendor/allOrders`, access token needed in the request header

### vendor login
use `POST` on `/vendor/login`, similar mechanism compared to customer login, no need to repeat.

### Vendor modify status
use `PATCH` on /vendor, pass in access token in request header and the state (wish to modify) in request body in JSON



## Notes for deliverable 3
Dummy users for testing username `test3`, password `test3`, you can also signup at `/Signup`
Please use `mongodb+srv://userWIT:somePassword@cluster0.v20k5.mongodb.net/cluster0?retryWrites=true&w=majority` to access database

Note: `snack-in-a-van-back-end` is the backend for deliverable 3, while `snack-in-a-van` is the backend for deliverable 2

## Notes for deliverable 2
### Access detail to database
MongoDB username:`userWIT`
MongoDB password:`somePassword`

MongoDB Compass connection string:  `mongodb+srv://userWIT:somePassword@cluster0.v20k5.mongodb.net/cluster0?retryWrites=true&w=majority`

Similarly put in the following in `.env` file:
    `connectionURL = "mongodb+srv://userWIT:somePassword@cluster0.v20k5.mongodb.net/cluster0?retryWrites=true&w=majority"`

