const {MongoClient} = require('mongodb');
const http = require('http');

const {mongoURL} = require('./config');
const {port} = require('./config');
const {pinolog} = require('./api/middlewares/logger')



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
 * @description Creates MongoDbConnection
 * @param {string} MONGO_URL 
 */
function createMongoConn(MONGO_URL)
{     
    return MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
           .then((client) => {
            mongoClient = client;
            dbObj = client.db('bookcaveDB');
            pinolog.info("Connnected to Database");
        }).catch((error) => {
            pinolog.error("Failed Connecting to database");
            pinolog.error(error.message);
        })
}







/**
 * 
 * @param {string} MONGODB_URL  - MongoDB connection String
 * @description Setups database connection and starts server 
 */

 function initServer(appObj) {

        const server = http.createServer(appObj);
        return Promise.resolve(server.listen(port))
        .catch((error) => {
            pinolog.error(error.message);
        }).then(() => {
            pinolog.info(`SERVER STARTED ON PORT NUMBER ${  port}`);
            process.on('exit', shutdown);
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            process.on('SIGKILL', shutdown);
            process.on('uncaughtException', shutdown);
        })
        .catch((error) => {
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

function runServer(appObj){
    createMongoConn(MONGODB_URL).then(()=>{
        initServer(appObj)
    });
    
};
 





module.exports.createMongoConn = createMongoConn;
module.exports.getDb = getDb;
module.exports.runServer = runServer;