//setting up the mongoose
const mongoose = require('mongoose')
//creating the schema for the user
const UserSchema  = mongoose.Schema({
    name:{type:String, required:true},
    user_name:{type:String, required:true, unique:true},
    balance:{type:Number, default:100},
    password:{type:String, required:true}
})
//creating the virtual field for the items owned by the users
UserSchema.virtual('items',{
    ref:'Product',
    localField: '_id',
    foreignField: 'owner'
})
//settting properties of the virutals to true so they will be included in the res.send
UserSchema.set('toJSON',{virtuals:true})
UserSchema.set('toObject',{virtuals:true})

//setting the model for the user
const User = mongoose.model('User',UserSchema,'users')
//exporting the user module
module.exports = User
