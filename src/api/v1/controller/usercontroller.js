const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mongo = require('mongodb');




const apiResponse = require("../../helpers/apiResponse");
let db = require("../../../app");
const passportFunctions = require("../../../config/passport");
const UserValidator = require("../../middlewares/validator");


const userCollection = "logincred"; //Database collection to be used in UserController
const bookCollection = "books";












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
    bcrypt.hash(req.body.password, 10).then(function (hash) {
        let signUpData = {
            "username": req.body.username,
            "useremail": req.body.useremail,
            "password": hash
        }
        return Promise.resolve(signUpData);
    }).catch((error) => {

        return apiResponse.ErrorResponse(res, error)
    }).then(function (signUpData) {
        let dataObject = {
            db: db.getDb(),
            collectionName: userCollection,
            data: signUpData
        }
        return Promise.resolve(insertSignupData(dataObject));
    }).catch((error) => {
        return apiResponse.ErrorResponse(res, error)
    }).then(function (jwtData) {
        return Promise.resolve(passportFunctions.issueJWT(jwtData));
    }).catch((error) => {
        return apiResponse.ErrorResponse(res, error)
    }).then(function (responseData) {
        return apiResponse.successResponseWithToken(res, responseData);
    });
};




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
    let paramobj = {
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
    }).catch((error) => {
        return apiResponse.ErrorResponse(res, error);
    });
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
 * 
 * @description Fetches user data from database
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function getprofile(req, res) {

    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let paramObj = {
        query: { "_id": o_id },
        collectionName: userCollection,
        db: db.getDb()
    }
    findUser(paramObj)
        .then(function (userInfo) {
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
    let query = { _id: o_id };
    let logincredcollection = db.getDb().collection(userCollection);
    updateUser(logincredcollection, query, newvalues)
        .then(function (userInfo) {
            return apiResponse.ModificationResponseWithData(res, "Modified", userInfo.result.nModified);
        }).catch((error) => {
            return apiResponse.notFoundResponse(res, "user not find");
        });
};




/**
 * @description Updates database with data passed
 * @param {object} query 
 * @param {object} updatedData 
 * @returns 
 */
function updateUser(dbobj, query, newValues) {
    return new Promise((resolve, reject) => {
        resolve(dbobj.updateOne(query, newValues));
    })
};








/**
 * @description Deletes User data from database along with its book data
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
function deleteprofile(req, res) {

    let o_id = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let obj = {
        query: { _id: o_id },
        userdb: db.getDb().collection(userCollection)
    }
    let bObj = {
        query: { "user_id": o_id },
        bookdb: db.getDb().collection(bookCollection)
    }

    Promise.all([deleteUserData(obj), deleteUsersBookData(bObj)])
        .then(function () {
            return apiResponse.ModificationResponseWithData(res, "Deleted");
        }).catch((error) => {
            return apiResponse.notFoundResponse(res, "user not find");
        });



};

/**
 * @description Deletes user from database using query passed
 * @param {object} query 
 * @returns Promise to be resolved
 */
function deleteUserData(obj) {
    return new Promise((resolve, reject) => {
        resolve(obj.userdb.deleteOne(obj.query));
    })
};


/**
 * @description deletes all books of a user
 * @param {object} Obj 
 * @returns 
 */
function deleteUsersBookData(Obj) {
    return new Promise((resolve, reject) => {
        resolve(Obj.bookdb.deleteMany(Obj.query));
    })
}



//Arrays to be exported to user.js
let signupFunctions = [
    UserValidator.validateUsername,
    UserValidator.validateUseremail,
    UserValidator.validatePassword,
    UserValidator.isDuplicateUser,
    signupFunc

];


let signinFunctions = [
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
