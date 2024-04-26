//importing the proper packages
const express = require('express')
const Product = require('../models/product.js')
const User = require('../models/user.js')
const authenticateUser = require('../middleware/authenticateUser')


const router = express.Router()

//this route is to get all of the products from the database
router.get('/products', async (req,res)=>{
    //this method returns all of the products
    const products = await Product.find({})
    res.send(products)
})

//this route is used to add a product to the database
router.post('/products',authenticateUser, async (req,res)=>{
    //creating a new product and setting the owner property to the session user
    //then sending the product
    try{
        const newProduct = new Product(req.body)
        newProduct.owner = req.user._id
        const product = await newProduct.save()
        res.send(product)
        
    }catch(e){
        //returning the error
        console.log(e)
        res.send({message:"Error adding product"})
    }

})

//this route allows a user to buy a product from another user
router.post('/products/buy',authenticateUser, async (req,res)=>{
    //storing the buyers username and product id
    const productID = req.body.productID
    //finding the product
    //if it doesnt exist then notify the user

    try{
        const product = await Product.findById(productID)
        if(!product){
            res.send({message:"Product does not exist"})
        }else{
            const owner = await User.findById(product.owner)
            const buyer = req.user
            //checking to see if the user is trying to buy their own product
            //checking to see if the buyer does not have enough money
            if(buyer.user_name === owner.user_name){
                res.send({message:"Oops, "+buyer.name+" already owns this item"})
            }else if(buyer.balance < product.price){
                res.send({message:"Oops, "+buyer.name+" has insufficient funds"})
            }else{
                //switching the owners and updating the balances of the buyer and seller
                product.owner = buyer._id
                buyer.balance -= product.price
                owner.balance += product.price
                //saving the objects and sending a success message
                await product.save()
                await buyer.save()
                await owner.save()
                res.send({message:"Transaction successful"})
            }
        }
       
    }catch(e){
        //sending the error
        console.log(e)
        res.send({message:"Error buying product"})
    }
})








//route to delete a product
router.delete('/products/:id',authenticateUser, async(req,res)=>{
    //saving the id of the product to delete
    const productToDelete = req.params.id
    try{
        //finding the product
        const product = await Product.findById(productToDelete)
        if(!product){
            //notifying if the product doesnt exist
            res.send({message:"Product does not exist"})
        }else{
            //checking to see if the user owns the product
            //deleting the product and notifying user if it was successful or if they are not authorized
            if(product.owner+"" === req.user._id+""){
                await Product.findByIdAndDelete(productToDelete)
                res.send({message:"Product was successfully deleted"})
            }else{
                res.send({message:"You are not authorized to perform this operation"})
            }
        }
        
    }catch(e){
        //sending the error
        res.send({message:"Error"})
        console.log(e)
    }
   
})



module.exports = router