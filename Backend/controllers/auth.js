const User = require('../models/User');

//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req, res, next) =>{
    try{
        const {name, email, password, role} = req.body;

        //Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        //Create token
        const token = user.getSignedJwtToken();

        res.status(200).json({success: true, token});
    }catch (err){
        console.log(err.stack);
        res.status(400).json({success: false});
    }
}