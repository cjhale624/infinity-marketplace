//setting up the mongoose
const { name } = require('ejs')
const mongoose = require('mongoose')
//creating the schema for the product
const ProductSchema = mongoose.Schema({
    name:{required: true, type: String},
    price:{required: true, type: Number},
    owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
})
//creating the model for the product
const Product = mongoose.model('Product',ProductSchema,"products")
//exporting the product module
module.exports = Product
