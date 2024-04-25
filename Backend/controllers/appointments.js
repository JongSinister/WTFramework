const Appointment = require("../models/Appointment");
const Hotel = require("../models/Hotel");

//@desc Get all appointment
//@route GET /api/v1/appointments
//@access Private
exports.getAppointments = async (req, res, next) => {
  let query;
  //General user can see only their appointments!
  if (req.user.role !== "admin") {
    query = Appointment.find({ user: req.user.id }).populate({
      path: "hotel",
      select: "name province tel",
    });
  } else {
    if (req.params.hotelId) {
      console.log(req.params.hotelId);
      query = Appointment.find({ hotel: req.params.hotelId }).populate({
        path: "hotel",
        select: "name province tel",
      });
    } else {
      query = Appointment.find().populate({
        path: "hotel",
        select: "name province tel",
      });
    }
  }
  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "cannot find Appointment",
    });
  }
};

//@desc Get single appointment
//@route GET /api/v1/appointment/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).pupulate({
      path: "hotel",
      select: "name description tel",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({
          success: false,
          message: `No appointment with the id of ${req.params.id}`,
        });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({success:false,message:"Cannot find Appointment"});
  }
};
//@desc Add appointment
//@route POST /api/v1/appointment/:hotelId/appointment
//@access Private
exports.addAppointment = async (req, res, next) => {
  try{
    req.body.hotel=req.params.hotelId;

    const hotel = await Hotel.findById(req.params.hotelId);

    if(!hotel){
      return res.status(404).json({success:false,message:`No hotel with the if of ${req.params.hotelId}`});
    }
    const appointment = await Appointment.create(req.body);

    res.status(200).json({
      success:true,
      data:appointment
    });
  }catch(error){
    console.log(error);
    return res.status(500).json({success:false,message:"Cannot create Appointment"});
  }
}


//@desc Update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateAppointment=async(req,res,next)=>{
  try{
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment){
      return res.status(404).json({success:false,message:`No appointment with if ${req.params.id}`});
    }

    //Make sure user is the appointment owner
    if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
    }
    appointment= await Appointment.findByIdAndUpdate(req.params.id, req.body,{new:true, runValidators:true});
    
    res.status(200).json({success:true, data:appointment});
  }catch(err){
    console.log(err.stack);
    return res.status(500).json({success:false, message:"Cannot update Appointment"});
  }
}

//@desc Delete appointment
//@route Delete /api/v1/appointments/:id
//@access Private
exports.deleteAppointment=async(req,res,next)=>{
  try{
    const appointment = await Appointment.findById(req.params.id);

    if(!appointment){
      return res.status(404).json({success:false, message:`No appt with id ${req.param.id}`})
    }

    //Make sure user is the appointment owner
    if(appointment.user.toString() !== req.user.id && req.user.role !== "admin"){
      return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`});
    }

    await appointment.deleteOne();

    res.status(200).json({success:true, data:{}});
  }catch(err){
    console.log(err.stack);
  }
}