const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    passport:{
        secret:'8ccaa3be77fb6c58cd57dc5df451c940df78a33c01d3c70e2d29a4235154850d',
        expiresIn: 1200,
    },
    port: process.env.PORT,
    mongoURL:process.env.MONGODB_URL
};

exports.underscoreId = '_id';