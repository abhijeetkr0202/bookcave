const express = require('express');
const { func, forbidden, assert } = require('joi');
const mongodb= require('mongodb');
var MongoClient = require('mongodb').MongoClient;

const app = express();
const mongoURL = require('./config');
//routes
var apiRouter = require('./api/routes/api');
var passport = require('passport');
const { applyPassportStrategy }=require('./config/passport');


//mongoDB connection
const MONGODB_URL = process.env.MONGODB_URL;
var dbObj;
var mongoclient;
MongoClient.connect(MONGODB_URL,{useUnifiedTopology:true}).then(client=>{
    console.log("Connnected to Database");
    mongoclient = client;
    const db = client.db('bookcaveDB');
    dbObj=db;
   
    //route prefixes
    app.use(apiRouter);
})
.catch(error=>
    console.error(error))


// app.use(passport.initialize());
// app.use(passport.session());
applyPassportStrategy(passport);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


function getDb() {
    return dbObj;
}

// function to close mongoDB connection
function shutdown(){
    mongoclient.close(()=>{
        console.log("MongoDB connection closed.");
    });
}


process.on('exit',shutdown);
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
process.on('SIGKILL',shutdown);
process.on('uncaughtException',shutdown);



module.exports.getDb=getDb;
module.exports=app;