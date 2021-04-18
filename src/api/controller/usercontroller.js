const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
var db = require("../../app");
const { validationResult } = require("express-validator");
const mongo = require('mongodb');
const { insertSignupData } = require("../../models/user");
const passportFunctions = require("../../config/passport");

let collectionName = "logincred"; //Database collection to be used in UserController
const UserValidator = require("../middlewares/validator");


exports.signup = [
    UserValidator.validateUsername,
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    UserValidator.isDuplicateUser,
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors);
                return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
            }
            else {
                bcrypt.hash(req.body.password, 10, function (err, hash) {
                    var signUpData = {
                        "username": req.body.username,
                        "useremail": req.body.useremail,
                        "password": hash
                    }
                    let dataObject = {
                        db: db.getDb(),
                        collectionName: collectionName,
                        data: signUpData
                    }
                    var insertData = new Promise(function (resolve, reject) {
                        resolve(insertSignupData(dataObject));
                    });
                    insertData.then((data) => {
                        return apiResponse.successResponseWithToken(res, passportFunctions.issueJWT(data));
                    });
                });
            }
        }
        catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }

];

exports.sigin = [
    UserValidator.validateUseremail,
    UserValidator.validatePassword,

    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "validation Error", errors.array());
            }
            else {
                let b = db.getDb();
                logincredcollection = b.collection(collectionName);
                logincredcollection.findOne({ useremail: req.body.useremail }).then(data => {
                    if (data) {
                        bcrypt.compare(req.body.password, data.password, function (err, same) {
                            if (same) {
                                return apiResponse.successResponseWithToken(res, passportFunctions.issueJWT(data));
                            }
                            else {
                                return apiResponse.unauthorizedResponse(res, "Wrong password");
                            }
                        });
                    }
                    else {
                        return apiResponse.unauthorizedResponse(res, "Wrong Credentials")
                    }
                });
            }
        }
        catch (err) { return apiResponse.ErrorResponse(res, err); }
    }
];



exports.getprofile = [
    (req, res) => {
        try {
            logincredcollection = db.getDb().collection(collectionName);
            let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
            let findUser = new Promise(function (resolve, reject) { resolve(logincredcollection.findOne({ _id: o_id })) });

            findUser.then((userInfo) => {
                delete userInfo.password;
                delete userInfo._id;
                return apiResponse.successResponseWithData(res, "Success", userInfo);
            });

        }
        catch (error) {
            return apiResponse.notFoundResponse(res, "Failed");
        }
    }
];

exports.updateprofile = [
    (req, res) => {
        try {
            logincredcollection = db.getDb().collection(collectionName);
            let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
            let newData = {
                username: req.body.username
            }

            let newvalues = { $set: newData };
            let findUser = new Promise(function (resolve, reject) { resolve(logincredcollection.updateOne({ _id: o_id }, newvalues)) });

            findUser.then((userInfo) => {
                return apiResponse.ModificationResponseWithData(res, "Modified", userInfo.result.nModified);
            });

        }
        catch (error) {
            return apiResponse.notFoundResponse(res, "user not find");
        }
    }
];

exports.deleteprofile = [
    (req, res) => {
        try {
            logincredcollection = db.getDb().collection(collectionName);
            var o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
            var findUser = new Promise(function (resolve, reject) { resolve(logincredcollection.deleteOne({ _id: o_id })) });
            findUser.then((userInfo) => {
                return apiResponse.ModificationResponseWithData(res, "Deleted");
            });

        }
        catch (error) {
            return apiResponse.notFoundResponse(res, "user not find");
        }
    }

];