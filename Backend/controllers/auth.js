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


//@desc    Login User
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = async (req, res, next) =>{
    try{
        const {email, password} = req.body;

        //Validate email and password
        if(!email || !password){
            return res.status(400).json({success: false,
                 msg:'Please provide an email and password'})
        }
    
        //check for user
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(400).json({success: false,
                msg:'Invalid credentials'});
        }
        //check if password matches
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({success: false,
                msg:'Invalid credentials'});
        }
    
        //create token
        const token = user.getSignedJwtToken();
    
        res.status(200).json({success: true, token});

    }catch(err){
        return res.status(401).json({success: false, msg: 'Cannot convert email or pass to string'});
    }
   
}

