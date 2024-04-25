const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { use } = require("../routes/appointments");

//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, tel, email, password, role } = req.body;

    //Create user
    const user = await User.create({
      name,
      tel, //Add tel number for user
      email,
      password,
      role,
    });

    //Create token
    // const token = user.getSignedJwtToken();
    sendTokenResponse(user, 200, res);
    //res.status(200).json({ success: true, token });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false });
  }
};

//@desc    Login User
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate email and password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    //check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }
    //check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    //create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({success: true, token});
    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, msg: "Cannot convert email or pass to string" });
  }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * (24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//@desc    Get current Logged in user
//@route   POST /api/v1/auth/me
//@access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

//@desc    Log out user
//@route   GET /api/v1/auth/logout
//@access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};

//@desc    Get user appointment
//@route   GET /api/v1/auth/appointment
//@access  Private
exports.getMyAppointment = async (req, res, next) => {
  //Find user appointment
  const userAppointments = await Appointment.find({ user: req.user.id }).populate({
    path: "hotel",
    select: "name address tel",
  });;

  //Check if user have no appointment
  if (!userAppointments || userAppointments.length===0) {
    return res
      .status(200)
      .json({ success: true, msg: `You have no appointment yet` });
  }

  return res.status(200).json({
    success: true,
    length: userAppointments.length,
    data: userAppointments,
  });
};


//@desc    Get user wifiPassword
//@route   GET /api/v1/auth/wifi
//@access  Private
exports.getMyWifiPassword = async (req, res, next) => {
    try {
        const userWifiAppointments = await Appointment.find({ user: req.user.id });

        // Extract WiFi passwords from appointments
        const userWifiPasswords = userWifiAppointments.map(appointment => ({
            apptDate: appointment.apptDate,
            wifiPassword: appointment.wifiPassword
        }));

        res.status(200).json({
            success: true,
            data: userWifiPasswords
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Cannot get Wifi passwords" });
    }
}

//@desc    Login to wifi
//@route   POST /api/v1/auth/wifi
//@access  Public
exports.loginToWifi = async (req, res, next) => {
    try {
        const {email, wifiPassword} = req.body;

        if(!email || !wifiPassword){
            return res.status(404).json({success: false, message: "Body is needed"});
        }
        const user = await User.findOne( {email} );
        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }
        // Check if the user has an appointment
        const appointments = await Appointment.find({ user: user._id });
        if (!appointments) {
            return res.status(400).json({ success: false, message: "User does not have any appointments" });
        }
        // Check if the appointment date is in the future
        const currentDateTime = new Date();
        let wrongPass = true;
        let nearFuture = false;
        for(each of appointments){
            if(each.wifiPassword === wifiPassword){
                if(each.apptDate > currentDateTime){
                    nearFuture = true;
                }
                wrongPass = false;
                break;
            }

        }

        if(wrongPass){
            return res.status(401).json({ success: false, message: "Incorrect WiFi password" });
        }
        if(nearFuture){
            return res.status(400).json({ success: false, message: "Appointment is in the future" });
        }
        res.status(200).json({success: true, message: "WiFi login successful"});

    }catch(err){
        console.log(err.stack);
        res.status(500).json({success: false, message: "Error when trying to login"});
    }
}