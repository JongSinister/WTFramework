const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  getMyAppointment,
  getMyWifiPassword,
  loginToWifi
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.get("/appointment", protect, getMyAppointment); //get appointment of user
router.route("/wifi").all(protect)
  .get(getMyWifiPassword)
  .post(loginToWifi);

module.exports = router;
