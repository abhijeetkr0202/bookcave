const { ExtractJwt, Strategy } = require("passport-jwt");
const mongo = require('mongodb');
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");


const config = require(".");
const db = require('../app')


// options defined for passport-jwt
const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.passport.secret;


const strategy = new Strategy(options, (payload, done) => {
    const logincredcollection = db.getDb().collection("logincred");
    const objId = new mongo.ObjectID(payload._id);

    logincredcollection.findOne({ _id: objId })
        .then((user) => {
            if (user) {
                return done(null, {
                    useremail: user.useremail,
                    _id: user._id
                });
            }
            return done(null, false);
        }).catch(function (err) {
            return done(err, false);
        })


});













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
    base64Url = jwt_decode(base64Url)
    return base64Url;
}



module.exports = {
    issueJWT,
    parseDatafromToken,
    strategy
}