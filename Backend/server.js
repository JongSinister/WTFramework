const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


//Rate limiting (max 100 requests in 10 mins)
const limiter = rateLimit({
    windowsMs : 10 * 60 * 1000,
    max : 100
});

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

//Route files
const hotels = require("./routes/hotels");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");


//Body parser
const app = express();
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(limiter);
app.use(xss());
app.use(hpp());
app.use(cors());
app.use('/api/v1/hotels',hotels);
app.use('/api/v1/auth', auth);
app.use("/api/v1/appointments",appointments);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT)
);

//Handle unhandles promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

//THIRAPUT HAS COME
