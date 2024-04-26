//importing the proper packages
const express = require('express')
const Note = require('../models/product.js')
const User = require('../models/user.js')
const Product = require('../models/product.js')
const bcrypt = require('bcrypt')
const authenticateUser = require('../middleware/authenticateUser')

const router = express.Router()

//route that creates and adds a new user to the database
router.post('/users/register', async (req,res)=>{
    //creating and saving the user to the database
    try{
        //storing all of the info from the body
        //including the name username password and balance
        const name = req.body.name
        const user_name = req.body.user_name
        const password = await bcrypt.hash(req.body.password,8)
        const balance = req.body.balance
        //creating a user if the balance is given
        if(balance){
            const u1 = new User({name:name, user_name:user_name,balance:balance,password:password})
            //const tempUser = {name:u1.name, user_name:u1.user_name,balance:u1.balance}
            const result = await u1.save()
            res.send(result)
        }else{
            //creating a user if there is no balance
            const u1 = new User({name:name, user_name:user_name,password:password})
            const result = await u1.save()
            res.send(result)
        }
    }catch(e){
        res.send(e)
    }

})

//route that authenticates a user with a valid username and password and logs them in
router.post('/users/login', async (req,res)=>{
    //storing the username password and user object
    const user_name = req.body.user_name
    const password = req.body.password
    const user = await User.findOne({user_name:user_name})

    //if there is no user then an error is sent
    if(!user){
        console.log("No user")
        res.send({message: "Error logging in. Incorrect username/password"})

    }else{
        //seeing if the passwords match by decrypting it
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            //is it is not a match then the error is sent
            console.log("password wrong")
            res.send({message: "Error logging in. Incorrect username/password"})
        }else{
            //the session id is set and a message is sent saying it is successful
            req.session.user_id = user._id
            res.send({message: "Successfully logged in. Welcome "+user.name})
        }
        
    }
    
})

//route that searches for a specific user from the database
router.get('/users/me',authenticateUser, async (req,res)=>{
    //searching for a user by their username from the database
    //including the virutal fields
    if(req.session.user_id){
        const u = await User.findById(req.user._id).populate('items').exec()
        res.send(u)
    }
})

//route to allow logged in users to logout
router.post('/users/logout',authenticateUser, async (req,res)=>{
    //destroying the session and sending a success message
    try{
        const logout = await req.session.destroy()
        res.send({message: "Successfully logged out "+req.user.name})
    }catch(e){
        //res.send({message: "Failure to log out"})
    }
})

//route to delete a speciic user based on their username
router.delete('/users/me', authenticateUser, async (req,res)=>{
    try{//using the find one function to search the database for the user based on their username
        const u = await User.findById(req.session.user_id)
       // console.log("Found user")
        const name = u.name
        await Product.deleteMany({owner:u._id})
       // console.log("deleted products")
        await User.findByIdAndDelete(req.session.user_id)
       // console.log("deleted user")
        await req.session.destroy()
       // console.log("deleted session")
        res.send({message:"Successfully deleted "+name})
    }catch(e){
        //sending an error to the user
        console.log(e)
            res.send({message:"Error deleting user"})
    }
    
    
})

//route to get a summary of the database
router.get('/summary',async (req,res)=>{
    //using the find function to find all of the users in the database
    const users = await User.find({}).populate('items').exec()
    //mapping the users to an array in the desired format and then sending it
    const userArr = users.map(u=>{
        return {balance: u.balance, _id:u._id,name:u.name,user_name:u.user_name, password:u.password, __v: u.__v, items: u.items, id:u.id}
    })
    res.send(userArr)

})


//exporting the router
module.exports = router
