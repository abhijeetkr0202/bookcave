const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    passport: {
        secret: process.env.secret_key,
        EXPIRES_IN: 24*60*60,
    },
    port: process.env.PORT,
    mongoURL: process.env.MONGODB_URL
};
