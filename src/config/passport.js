const { ExtractJwt, Strategy } = require("passport-jwt");
const config = require(".");
const db = require('../app')
const mongo = require('mongodb');
const { func } = require("joi");
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");
const { default: jwtDecode } = require("jwt-decode");



// options defined for passport-jwt
const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.passport.secret;


const strategy = new Strategy(options, (payload, done) => {
    logincredcollection = db.getDb().collection("logincred");
    var o_id = new mongo.ObjectID(payload._id);

    logincredcollection.findOne({ _id: o_id }, (err, user) => {
        if (err) return done(err, false);
        if (user) {
            return done(null, {
                useremail: user.useremail,
                _id: user._id
            });
        }
        return done(null, false);
    });
});













/**
 * @description Issues JWT 
 * @param {object} data 
 * object with user data
 * @returns Response to API request with user info and TOKEN
 */
exports.issueJWT = function issueJWT(data) {
    const jwtpayload = { _id: data._id, iat: Date.now() };
    const token = jwt.sign(jwtpayload, config.passport.secret, {
        expiresIn: config.passport.expiresIn,
    });

    const responseJWT = { ...{ data } };
    delete responseJWT.data.password;
    delete responseJWT.data._id;
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



exports.applyPassportStrategy = passport => {
    passport.use(strategy);
};