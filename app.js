//importing all of the required packages
const express = require('express')
const fs= require('fs')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const dotenv = require('dotenv')
dotenv.config()
const Note = require('./models/product.js')
const User = require('./models/user.js')

const userRouter = require('./routers/user.js')
const noteRouter = require('./routers/product.js')


//setting up the express
const app = express()

app.listen(process.env.PORT)

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())


//connecting the mongodb database and connecting through mongoose
const url = process.env.MONGO_URL
mongoose.connect(url,(err)=>{
    if(err)
        console.log("Error connecting to DB..")
    else
        console.log("Successfully connected to DB..")
})
app.use(session({
    secret:process.env.SESSION_KEY,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:url})

}))
app.use(userRouter)
app.use(noteRouter)


    