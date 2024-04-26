const User = require('../models/user')

async function authenticateUser(req,res,next){
    //making sure there is a session user_id
    if(!req.session.user_id){
        res.send({message: "This page requires you to be loggged in"})
    }else{
        //setting the session cookie to the user
        const user = await User.findById(req.session.user_id)
        req.user = user
        next()
    }
    
}
module.exports = authenticateUser