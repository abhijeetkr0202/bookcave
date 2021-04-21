const { validationResult } = require("express-validator");
const mongo = require('mongodb');



const apiResponse = require('../../helpers/apiResponse');
let db = require("../../../app")
const passportFunctions = require("../../../config/passport");


// const multer  = require('multer');
// let upload = multer({dest:"../../../uploads/"});


let userCollection = "logincred";
let collectionName= "books";



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
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return apiResponse.validationErrorWithData(res,"Validation Error",errors.array());

        }
        else
        {
            let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
            let bookData = {
                "booktitle": req.body.booktitle,
                "bookfilepath":"somefuncreturningPath",
                "lastvisited":0,
                "markedpages":[],
                "user_id":uid
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
            });

        }
    }
    catch(err){
        return apiResponse.ErrorResponse(res,err);
    }
}







//Arrays to be exported to route functions
// let bookUploadFunctions = [
//     upload.single(),
//     addbookFunc
    

// ];


// module.exports={
//     bookUploadFunctions
// }