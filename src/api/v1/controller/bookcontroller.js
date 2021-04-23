const { validationResult } = require("express-validator");
const mongo = require('mongodb');



const apiResponse = require('../../helpers/apiResponse');
let db = require("../../../app")
const passportFunctions = require("../../../config/passport");
const bookValidator = require("../../middlewares/validator");




let userCollection = "logincred";
let collectionName= "books";


/**
 * @description Functions that inserts book data in database
 * @param {object} dbObject 
 * @returns object with book data
 */
function insertBookData (dbObject){
    let collection = dbObject.db.collection(dbObject.collectionName);
    collection.insertOne(dbObject.data);
    return dbObject.data;
};

/**
 * 
 * @description Add books to database
 * @param {object} req 
 * @param {object} res 
 * @returns apiResponse
 */
function addbookFunc(req,res){
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return apiResponse.validationErrorWithData(res,"Validation Error",errors.array());

        }
        else
        {
            let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
            req.body.lastVisitedOn = Date.now().toString()
            let bookData = {
                "booktitle": req.body.booktitle,
                "bookfilepath":"somefuncreturningPath",
                "lastVisitedPage":req.body.lastisitedPage,
                "markedpages":[],
                "user_id":uid,
                "uploadedOn": Date.now().toString(),
                "lastVisitedOn": req.body.lastVisitedOn
            }
            let dataObject = {
                db: db.getDb(),
                collectionName: collectionName,
                data: bookData
            }
            let insertData = new Promise(function (resolve, reject) {
                resolve(insertBookData(dataObject));
            });
            insertData.then((data) => {
                return apiResponse.successResponse(res,"Uploaded");
            }).catch((error)=>{
                console.error(error);
            });

        }
}








// Arrays to be exported to route functions
let bookUploadFunctions = [
    bookValidator.validateBooktitle,
    bookValidator.validatelastVisitedPage,
    bookValidator.validatelastVisitedOn,
    addbookFunc
];


module.exports={
    bookUploadFunctions
}