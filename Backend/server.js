const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const hotels = require('./routes/hotels');
const auth = require('./routes/auth');

//Body parser
const app=express();
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use('/api/v1/hotels',hotels);
app.use('/api/v1/auth', auth);

const PORT=process.env.PORT || 5000;
const server=app.listen(PORT, console.log('Server running in', process.env.NODE_ENV,'mode on port', PORT));

//Handle unhandles promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})

//THIRAPUT HAS COME