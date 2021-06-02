const pinolog = require('pino')();
const logger = require('pino-http')({
    logger:pinolog
});


module.exports = {pinolog,logger}