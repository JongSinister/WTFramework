const Hotel = require("../models/Hotel");

//@desc     Get all hotels
//@route    GET/api/v1/hotels
//@access   Public
exports.getHotels = async (req, res, next) => {
  res.status(200).json({ success: true, msg: "Show all hotels" });
};
