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
                "lastVisitedPage":req.body.lastVisitedPage,
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




/**
 * @description return array of books from db using user id
 * @param {object} dbobj 
 * @param {mongo.ObjectID} id 
 * @returns 
 */
function findbooks(dbobj,id)
{
    return new Promise((resolve,reject)=>{
        // let resArr = dbobj.collection(collectionName).aggregate({"user_id":id},{"$project":{"user_id":0,"markedpages":0,"lastVisitedPage":0}}).toArray();
        let resArr = dbobj.collection(collectionName).aggregate({"user_id":id}).toArray();
        resolve(resArr);
    });
}


/**
 * @description Returns api response with list of books for logged in user
 * @param {object} req 
 * @param {object} res 
 */
function listbookFunc(req,res){
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    findbooks(db.getDb(),uid).
    then((resArr)=>{
        resArr.forEach(book => {
            delete book.user_id;
            delete book.lastVisitedPage;
            delete book.markedpages;
        });
        return apiResponse.successResponseWithData(res,"Successful",resArr)
    }).catch((error)=>{
        console.error(error);
    });
}













// Arrays to be exported to route functions
let bookUploadFunction = [
    bookValidator.validateBooktitle,
    bookValidator.validatelastVisitedPage,
    bookValidator.validatelastVisitedOn,
    addbookFunc
];

let bookListFunction = [
    listbookFunc
];

module.exports={
    bookUploadFunction,
    bookListFunction
}