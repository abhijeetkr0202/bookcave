const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    passport:{
        secret:process.env.secret_key,
        expiresIn: 12000000000,
    },
    port: process.env.PORT,
    mongoURL:process.env.MONGODB_URL
};

exports.underscoreId = '_id';