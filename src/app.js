const express = require('express');
const app = express();

//routes
var apiRouter = require('./api/routes/api');


app.use((req,res,next)=>{
    console.log("middleware working");
    next();
});


app.use(apiRouter);

module.exports = app;