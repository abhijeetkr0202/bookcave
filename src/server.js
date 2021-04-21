const http = require('http');




const app = require('./app');
const port = require('./config').port;


const server = http.createServer(app);

/**
 * Initiate server on port
 */
server.listen(port, () => {
    console.log("server started at port " + port);
});

