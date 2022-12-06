const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const connectDb = require('./db/db')
require('dotenv').config()




//initialize express app
const app = express()

//create our port 
const PORT = process.env.PORT || 8001

//connect our database
connectDb()

// for parsing application/json
app.use(express.json({ limit: "30mb", extended: true }))
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: "30mb", extended: true }))


//enabling cors
app.use(cors())

//enables us to se logs in our terminal
app.use(morgan('tiny')) //used to log request from the frontend
//get cookies
app.use(cookieParser())

/*enabling express to locate static files
app.use(express.static('public')) */

//enabling express to locate static files using virtual path /
app.use('/', express.static(path.join(__dirname, '/public')))


//get my routes

const userRouter = require('./routes/userRoute')
const authRouter = require('./routes/authRoute')

app.use('/', userRouter)
app.use('/', authRouter)



app.listen(PORT, (req, res) => {
    console.log(`app running on port ${PORT}`)
})

