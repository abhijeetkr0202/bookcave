const jwt = require('jsonwebtoken');
const jwtDecode = require("jwt-decode");
const config = require('../../config/index')

/**
 * @description Issues JWT 
 * @param {object} data 
 * object with user data
 * @returns Response to API request with user info and TOKEN
 */
 function issueJWT(data) {
    const currDate = Date.now() / 1000;
    const jwtpayload = { _id: data._id, iat: currDate };
    const token = jwt.sign(jwtpayload, config.passport.secret, {
        expiresIn: config.passport.EXPIRES_IN,
    });

    const responseJWT = {
        "data": {
            username: data.username,
            useremail: data.useremail
        }
    };
    responseJWT.data.token = token;
    responseJWT.data.token_type = "Bearer";

    return responseJWT;
}


/**
 * 
 * @description Parse data from Authentication Token recieved from Authorization header 
 * @param {string} headerData Token from body header
 * @returns decoded ID from token 
 */
function parseDatafromToken(headerData) {
    let base64Url = headerData;
    base64Url = jwtDecode(base64Url)
    return base64Url;
}

module.exports = {
    issueJWT,
    parseDatafromToken
}