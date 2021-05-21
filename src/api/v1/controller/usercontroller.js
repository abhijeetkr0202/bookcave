const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mongo = require('mongodb');




const apiResponse = require("../../helpers/apiResponse");
const db = require("../../../app");
const passportFunctions = require("../../../config/passport");
const UserValidator = require("../../middlewares/validator");
const userSchemaValidate = require("../../../models/user").userDataValidate;


const userCollection = "logincred";
const bookCollection = "books";












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
    bcrypt.hash(req.body.password, 10)
    .then(function (hash) {
        const signUpData = {
            "username": req.body.username,
            "useremail": req.body.useremail,
            "password": hash
        }
        if(!userSchemaValidate(signUpData))
        {
            throw new Error("User Data Failed Schema Validation")
        }
        return Promise.resolve(signUpData);
    })
    .then(function (signUpData) {
        const dataObject = {
            db: db.getDb(),
            collectionName: userCollection,
            data: signUpData
        }
        return Promise.resolve(insertSignupData(dataObject));
    })
    .then(function (jwtData) {
        return Promise.resolve(passportFunctions.issueJWT(jwtData));
    })
    .then(function (responseData) {
        return apiResponse.successResponseWithToken(res, responseData);
    })
    .catch(function (error) {
        return apiResponse.ErrorResponse(res,error.message)
    });
};





/**
 * 
 * @description FindUser in database 
 * @param {Object} paramObj
 * @returns Promise , resolved(userdata)
 */
 function findUser(paramObj) {
    return new Promise((resolve) => {
        resolve(paramObj.db.collection(paramObj.collectionName).findOne(paramObj.query));
    })
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
    const paramobj = {
        query: { useremail: req.body.useremail },
        db: db.getDb(),
        collectionName: userCollection,

    }
    findUser(paramobj).then(function (data) {
        if (data) {

            bcrypt.compare(req.body.password, data.password)
                .then(function (same) {
                    if (same) {
                        return apiResponse.successResponseWithToken(res, passportFunctions.issueJWT(data));
                    }
                    return apiResponse.unauthorizedResponse(res, "Wrong password");
                })
        }
        else {
            return apiResponse.unauthorizedResponse(res, "Wrong Credentials")
        }
    }).catch(function (error){
        return apiResponse.ErrorResponse(res, error.message);
    });
};






/**
 * 
 * @description Fetches user data from database
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function getprofile(req, res) {

    const objId = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const paramObj = {
        query: { "_id": objId },
        collectionName: userCollection,
        db: db.getDb()
    }
    findUser(paramObj)
        .then(function (userInfo) {
            delete userInfo.password;
            delete userInfo._id;
            return apiResponse.successResponseWithData(res, "Success", userInfo);
        }).catch(function (error){
            return apiResponse.notFoundResponse(res, error.message);
        });

};





/**
 * @description Updates database with data passed
 * @param {object} query 
 * @param {object} updatedData 
 * @returns 
 */
 function updateUser(dbobj, query, newValues) {
    return new Promise((resolve) => {
        resolve(dbobj.updateOne(query, newValues));
    })
};



/**
 * @description Updates user's details
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function editprofile(req, res) {
    const objId = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    const newData = {
        username: req.body.username
    }

    const newvalues = { $set: newData };
    const query = { _id: objId };
    const logincredcollection = db.getDb().collection(userCollection);
    updateUser(logincredcollection, query, newvalues)
        .then(function (userInfo) {
            return apiResponse.ModificationResponseWithData(res, "Modified", userInfo.result.nModified);
        }).catch(function (error) {
            return apiResponse.notFoundResponse(res, "user not find");
        });
};







/**
 * @description Deletes user from database using query passed
 * @param {object} query 
 * @returns Promise to be resolved
 */
 function deleteUserData(obj) {
    return new Promise((resolve) => {
        resolve(obj.userdb.deleteOne(obj.query));
    })
};


/**
 * @description deletes all books of a user
 * @param {object} Obj 
 * @returns 
 */
function deleteUsersBookData(Obj) {
    return new Promise((resolve) => {
        resolve(Obj.bookdb.deleteMany(Obj.query));
    })
}






/**
 * @description Deletes User data from database along with its book data
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function deleteprofile(req, res) {

    const objId = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const obj = {
        query: { _id: objId },
        userdb: db.getDb().collection(userCollection)
    }
    const bObj = {
        query: { "user_id": objId },
        bookdb: db.getDb().collection(bookCollection)
    }

    Promise.all([deleteUserData(obj), deleteUsersBookData(bObj)])
        .then(function () {
            return apiResponse.ModificationResponseWithData(res, "Deleted");
        }).catch(function (error){
            return apiResponse.notFoundResponse(res, "user not find");
        });



};





const signupFunctions = [
    UserValidator.validateUsername,
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    UserValidator.isDuplicateUser,
    signupFunc

];


const signinFunctions = [
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    signinFunc

];



module.exports = {
    signupFunctions,
    signinFunctions,
    getprofile,
    editprofile,
    deleteprofile
}
