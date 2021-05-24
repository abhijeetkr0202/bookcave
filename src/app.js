const express = require('express');

const {MongoClient} = require('mongodb');

const app = express();
const passport = require('passport');
const http = require('http');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const pinolog = require('pino')();
const logger = require('pino-http')({
    logger:pinolog
});



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
        pinolog.info("MongoDB connection closed.");
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
        .catch((error) => {
            pinolog.error(error.message)
            process.exit(1)
        })
        .then((client) => {
            mongoClient = client;
            dbObj = client.db('bookcaveDB');
            pinolog.info("Connnected to Database");
            return Promise.resolve(dbObj);
        }).catch((error) => {
            pinolog.error("Failed Connecting to database");
            pinolog.error(error.message);
            process.exit(1);
        })
        .then(() => {
            const server = http.createServer(app);
            return Promise.resolve(server.listen(port));
        }).catch((error) => {
            pinolog.error(error.message);
        }).then(() => {
            pinolog.info(`SERVER STARTED ON PORT NUMBER ${  port}`);

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
        }).catch((error) => {
            pinolog.error(error.message);
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