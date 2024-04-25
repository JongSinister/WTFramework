const Appointment = require("../models/Appointment");

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
      if(req.params.hotelId){
        console.log(req.params.hotelId);
        query = Appointment.find({hotel: req.params.hotelId}).populate({
          path: "hotel",
          select: "name province tel",
        });
      }else{
        query=Appointment.find().populate({
          path:"hotel",
          select: "name province tel"
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