const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mongo = require('mongodb');




const apiResponse = require("../../helpers/apiResponse");
let db = require("../../../app");
const passportFunctions = require("../../../config/passport");
const UserValidator = require("../../middlewares/validator");
let SchemaValidator = require('../../../models/user');


let collectionName = "logincred"; //Database collection to be used in UserController


/**
 * 
 * @description Inserts data from dataobject to collection of DB
 * @param {object} dbObject 
 * @returns data object
 */
function insertSignupData(dbObject) {
    // SchemaValidator.userSchemaValidator();
    // dbObject.db.createCollection("logincred",{
    //     validator: {
    //         $jsonSchema: {
    //             bsonType:"object",
    //             required:["username","useremail","password"],
    //             properties:{
    //                 username:{
    //                     bsonType:"string",
    //                     description:"String allowed and is required"
    //                 },
    //                 useremail:{
    //                     bsonType:"string",
    //                     description:"String allowed and is required"
    //                 },
    //                 password:{
    //                     bsonType:"bindata",
    //                     description:"Hashed password"
    //                 }
    //             }
    //         }
    //     }
    // })
    dbObject.db.collection(dbObject.collectionName).insertOne(dbObject.data);
    return dbObject.data;

};






/**
 * 
 * @description FindUser in database 
 * @param {Object} paramObj
 * @returns Promise , resolved(userdata)
 */
function findUser(paramObj) {
    return new Promise((resolve, reject) => {
        resolve(paramObj.db.collection(paramObj.collectionName).findOne(paramObj.query));
    })
};

/**
 * @description Updates database with data passed
 * @param {object} query 
 * @param {object} updatedData 
 * @returns 
 */
function updateUser(dbobj,query,newValues) {
    return new Promise((resolve, reject) => {
        resolve(dbobj.updateOne(query, newValues));
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
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "validation Error", errors.array());
    }
    else {
        let paramobj={
            query:{ useremail: req.body.useremail },
            db:db.getDb(),
            collectionName:collectionName,

        }
        findUser(paramobj).then(data => {
            if (data) {

                bcrypt.compare(req.body.password, data.password)
                    .then((same) => {
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
function getprofile(req, res) {

    logincredcollection = db.getDb().collection(collectionName);
    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let paramObj = {
        query: { "_id": o_id },
        collectionName: collectionName,
        db: db.getDb()
    }
    findUser(paramObj)
        .then((userInfo) => {
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
    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let newData = {
        username: req.body.username
    }

    let newvalues = { $set: newData };

    // let paramobj={
    //     query:{ _id: o_id },
    //     db:db.getDb(),
    //     collectionName:collectionName
    // }
    let query = {_id:o_id};
    let logincredcollection = db.getDb().collection(collectionName);
    updateUser(logincredcollection,query,newvalues)
        .then((userInfo) => {
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

    deleteUser({ _id: o_id })
        .then(() => {
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
