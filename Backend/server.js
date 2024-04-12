const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const hotels = require('./routes/hotels');

//Body parser
const app=express();
app.use(express.json());
app.use('/api/v1/hotels',hotels);

const PORT=process.env.PORT || 5000;
const server=app.listen(PORT, console.log('Server running in', process.env.NODE_ENV,'mode on port', PORT));

//Handle unhandles promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})

//THIRAPUT HAS COME