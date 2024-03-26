const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Load env vars
dotenv.config({path:'./config/config.env'});

//connect to database
connectDB();

// Route files
const coworkings = require("./routes/coworkings");
const auth = require("./routes/auth");
const reservations = require("./routes/reservations");

const app=express();

const PORT = process.env.PORT || 5000;

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max: 500
    });
app.use(limiter);  

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

const swaggerOptions={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
              title:'Library API',
              version:'1.0.0',
            description:'A simple Wxpress Coworkingspace API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/project'
            }
        ],
    },
    apis:['./routes/*.js']
};
const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

app.use("/api/project/coworkings", coworkings);
app.use("/api/project/auth", auth);
app.use("/api/project/reservations", reservations);

const server = app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,'on '+ process.env.HOST +':' + PORT));

//Handle unhandled promise rejections
process.on(`unhandledRejection`,(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});