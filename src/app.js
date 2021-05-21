const express = require('express');

const {MongoClient} = require('mongodb');

const app = express();
const passport = require('passport');
const http = require('http');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const logger = require('pino-http')();

const {mongoURL} = require('./config');
const apiRouterV1 = require('./api/v1/routes/api');
const {strategy} = require('./config/passport');
const {port} = require('./config');



let dbObj = null;
let mongoClient = null;
const MONGODB_URL = mongoURL;




/**
 * @description Closes mongoDb connection 
 * */
 function shutdown() {
    mongoClient.close(() => {
        console.log("MongoDB connection closed.");
        process.exit(1);
    });
}





/**
 * 
 * @param {string} MONGODB_URL  - MongoDB connection String
 * @description Setups database connection and starts server 
 */

function initServer(MONGO_URL) {
    MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
        .catch(function (error) {
            console.error(error.message)
            process.exit(1)
        })
        .then(function (client) {
            mongoClient = client;
            dbObj = client.db('bookcaveDB');
            console.log("Connnected to Database");
            return Promise.resolve(dbObj);
        }).catch(function (error) {
            console.log("Failed Connecting to database");
            console.error(error.message);
            process.exit(1);
        })
        .then(function () {
            const server = http.createServer(app);
            return Promise.resolve(server.listen(port));
        }).catch((error) => {
            console.error(error.message);
        }).then(function () {
            console.log(`SERVER STARTED ON PORT NUMBER ${  port}`);

            passport.use(strategy);

            app.use(logger);
            app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
            app.use(express.json());
            app.use(express.urlencoded({ extended: false }));
            app.use('/v1', apiRouterV1);
            app.use(cors());
            
            process.on('exit', shutdown);
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            process.on('SIGKILL', shutdown);
            process.on('uncaughtException', shutdown);
        }).catch(function (error) {
            console.error(error.message);
        });
}






/**
 * 
 * @returns database object from MongoClient Connection 
 */
function getDb() {
    return dbObj;
}








initServer(MONGODB_URL);   





module.exports.getDb = getDb;
module.exports.app = app;