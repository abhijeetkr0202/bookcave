const { ExtractJwt, Strategy } = require("passport-jwt");
const mongo = require('mongodb');
const { func } = require("joi");
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");


const config = require(".");
const db = require('../app')


// options defined for passport-jwt
const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.passport.secret;


const strategy = new Strategy(options, (payload, done) => {
    logincredcollection = db.getDb().collection("logincred");
    let o_id = new mongo.ObjectID(payload._id);

    logincredcollection.findOne({ _id: o_id })
        .then((user) => {
            if (user) {
                return done(null, {
                    useremail: user.useremail,
                    _id: user._id
                });
            }
            return done(null, false);
        }).catch((err) => {
            return done(err, false);
        })


});













/**
 * @description Issues JWT 
 * @param {object} data 
 * object with user data
 * @returns Response to API request with user info and TOKEN
 */
exports.issueJWT = function issueJWT(data) {
    let currDate = Date.now() / 1000;
    let jwtpayload = { _id: data._id, iat: currDate };
    let token = jwt.sign(jwtpayload, config.passport.secret, {
        expiresIn: config.passport.EXPIRES_IN,
    });

    let responseJWT = {
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
exports.parseDatafromToken = function parseDatafromToken(headerData) {
    let base64Url = headerData;
    base64Url = jwt_decode(base64Url)
    return base64Url;
}



exports.applyPassportStrategy = function (passport) {
    passport.use(strategy);
};