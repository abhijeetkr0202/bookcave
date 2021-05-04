const express = require('express');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const passport = require('passport');
const http = require('http');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const mongoURL = require('./config').mongoURL;
const apiRouterV1 = require('./api/v1/routes/api');
const applyPassport = require('./config/passport');
const userSchemaValidator = require('./models/user').userSchemaValidator;
const bookSchemaValidator = require('./models/book').bookSchemaValidator;
const port = require('./config').port;



let dbObj=null;
let mongoClient=null;
const MONGODB_URL = mongoURL;







/**
 * 
 * @param {string} MONGODB_URL  - MongoDB connection String
 * @description Setups database connection and starts server 
 */

function initServer(MONGODB_URL) {
    MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true })
    .catch(error =>console.error(error))
    .then(client => {
        console.log("Connnected to Database");
        mongoClient = client;
        dbObj = client.db('bookcaveDB');
        
        // userSchemaValidator();
        // bookSchemaValidator();
        return Promise.resolve(dbObj);
    }).catch((error)=>{
        console.error(error);
    })
    .then(()=>{
        const server = http.createServer(app);
        return Promise.resolve(server.listen(port));
    }).catch((error)=>{
        console.error(error);
    }).then(()=>{
        console.log("SERVER STARTED ON PORT NUMBER "+port);
            applyPassport.applyPassportStrategy(passport);
            
            app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
            app.use(express.json());
            app.use(express.urlencoded({ extended: false }));
            app.use('/v1',apiRouterV1);
            app.use(cors());
            process.on('exit', shutdown);
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            process.on('SIGKILL', shutdown);
            process.on('uncaughtException', shutdown);
    }).catch((error)=>{
        console.error(error);
    });
}






/**
 * 
 * @returns database object from MongoClient Connection 
 */
function getDb() {
    return dbObj;
}


/**
 * @description Closes mongoDb connection 
 * */
function shutdown() {
    mongoClient.close(() => {
        console.log("MongoDB connection closed.");
    });
    process.exit(1);
}







initServer(MONGODB_URL);    //Creating Database connection


















/**
 * @description Closes mongoDB connection
 */
module.exports.getDb = getDb;
module.exports = app;