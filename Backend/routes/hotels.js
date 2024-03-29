const express = require('express');
const {getHotels} = require('../controllers/hotels');

const router = express.Router();

router.route('/').get(getHotels);

module.exports=router;