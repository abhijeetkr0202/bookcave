const express = require('express');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const passport = require('passport');


const mongoURL = require('./config').mongoURL;
const apiRouterV1 = require('./api/v1/routes/api');
const { applyPassportStrategy } = require('./config/passport');


let dbObj;
let mongoClient;


/**
 * 
 * @param {string} MONGODB_URL  - MongoDB connection String
 * @description Setups database connection 
 */

function initDB(MONGODB_URL) {
    MongoClient.connect(MONGODB_URL, { useUnifiedTopology: true }).then(client => {
        console.log("Connnected to Database");
        mongoClient = client;
        dbObj = client.db('bookcaveDB');
        app.use('/v1',apiRouterV1);
    })
        .catch(error =>
            console.error(error))
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
}





const MONGODB_URL = mongoURL;

initDB(MONGODB_URL);    //Creating Database connection





applyPassportStrategy(passport);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));












/**
 * @description Closes mongoDB connection
 */
process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGKILL', shutdown);
process.on('uncaughtException', shutdown);



module.exports.getDb = getDb;
module.exports = app;