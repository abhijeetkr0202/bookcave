const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mongo = require('mongodb');




const apiResponse = require("../../helpers/apiResponse");
let db = require("../../../app");
const passportFunctions = require("../../../config/passport");
const UserValidator = require("../../middlewares/validator");



let collectionName = "logincred"; //Database collection to be used in UserController


/**
 * 
 * @description Inserts data from dataobject to collection of DB
 * @param {object} dbObject 
 * @returns data object
 */
function insertSignupData(dbObject) {
    dbObject.db.collection(dbObject.collectionName).insertOne(dbObject.data);
    return dbObject.data;

};






/**
 * 
 * @description FindUser in database 
 * @param {Object} query 
 * @returns Promise , resolved(userdata)
 */
function findUser(query) {
    return new Promise((resolve, reject) => {
        resolve(db.getDb().collection(collectionName).findOne(query));
    })
};

/**
 * @description Updates database with data passed
 * @param {object} query 
 * @param {object} updatedData 
 * @returns 
 */
function updateUser(query, updatedData) {
    return new Promise((resolve, reject) => {
        resolve(logincredcollection.updateOne(query, updatedData));
    })
};


/**
 * @description Deletes user from database using query passed
 * @param {object} query 
 * @returns 
 */
function deleteUser(query) {
    return new Promise((resolve, reject) => {
        resolve(logincredcollection.deleteOne(query));
    })
};


/**
 * @description Checks for validation results and adds new user to database accordingly
 * @param {object} req 
 * @param {object} res 
 * @returns apiResponse
 */
function signupFunc(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
    }
    else {
        bcrypt.hash(req.body.password, 10).then((hash) => {
            let signUpData = {
                "username": req.body.username,
                "useremail": req.body.useremail,
                "password": hash
            }
            return Promise.resolve(signUpData);
        }).catch((error) => {

            return apiResponse.ErrorResponse(res, error)
        }).then((signUpData) => {
            let dataObject = {
                db: db.getDb(),
                collectionName: collectionName,
                data: signUpData
            }
            return Promise.resolve(insertSignupData(dataObject));
        }).catch((error) => {
            return apiResponse.ErrorResponse(res, error)
        }).then((jwtData) => {
            return Promise.resolve(passportFunctions.issueJWT(jwtData));
        }).catch((error) => {
            return apiResponse.ErrorResponse(res, error)
        }).then((responseData) => {
            return apiResponse.successResponseWithToken(res, responseData);
        });
    }
};






/**
 * @description Checks for validation result and Logs in registered users 
 * @param {object} req 
 * @param {object} res 
 * @returns apiResponse
 */
function signinFunc(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "validation Error", errors.array());
    }
    else {
        findUser({ useremail: req.body.useremail }).then(data => {
            if (data) {

                bcrypt.compare(req.body.password, data.password).then((same) => {
                    if (same) {
                        return apiResponse.successResponseWithToken(res, passportFunctions.issueJWT(data));
                    }
                    return apiResponse.unauthorizedResponse(res, "Wrong password");
                })
            }
            else {
                return apiResponse.unauthorizedResponse(res, "Wrong Credentials")
            }
        }).catch((error) => {
            return apiResponse.ErrorResponse(res, error);
        });
    }
};






/**
 * 
 * @description Fetches user data from database
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function getprofile
    (req, res) {

    logincredcollection = db.getDb().collection(collectionName);
    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    findUser({ _id: o_id }).then((userInfo) => {
        delete userInfo.password;
        delete userInfo._id;
        return apiResponse.successResponseWithData(res, "Success", userInfo);
    }).catch((error) => {
        return apiResponse.notFoundResponse(res, "Failed");
    });

};



/**
 * @description Updates user's details
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function editprofile(req, res) {
    logincredcollection = db.getDb().collection(collectionName);
    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let newData = {
        username: req.body.username
    }

    let newvalues = { $set: newData };

    updateUser({ _id: o_id }, newvalues).then((userInfo) => {
        return apiResponse.ModificationResponseWithData(res, "Modified", userInfo.result.nModified);
    }).catch((error) => {
        return apiResponse.notFoundResponse(res, "user not find");
    });
};






/**
 * @description Deletes User data from database
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function deleteprofile(req, res) {

    logincredcollection = db.getDb().collection(collectionName);
    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    deleteUser({ _id: o_id }).then(() => {
        return apiResponse.ModificationResponseWithData(res, "Deleted");
    }).catch((error) => {
        return apiResponse.notFoundResponse(res, "user not find");
    });



};



//Arrays to be exported to user.js
let signupFunctions = [
    UserValidator.validateUsername,
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    UserValidator.isDuplicateUser,
    signupFunc

];


let siginFunctions = [
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    signinFunc

];



module.exports = {
    signupFunctions,
    siginFunctions,
    getprofile,
    editprofile,
    deleteprofile
}
