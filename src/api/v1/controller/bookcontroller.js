const { validationResult } = require("express-validator");
const mongo = require('mongodb');
const fetch = require('node-fetch');


const apiResponse = require('../../helpers/apiResponse');
let db = require("../../../app")
const passportFunctions = require("../../../config/passport");
const bookValidator = require("../../middlewares/validator");
const { func } = require("joi");




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
                return apiResponse.ErrorResponse(res,error);
            });

        }
}




/**
 * @description return array of books from db using user id
 * @param {object} dbobj 
 * @param {mongo.ObjectID} id 
 * @returns 
 */
function findAllbooks(dbobj,id)
{
    return new Promise((resolve,reject)=>{
        // let resArr = dbobj.collection(collectionName).aggregate({"user_id":id},{"$project":{"user_id":0,"markedpages":0,"lastVisitedPage":0}}).toArray();
        let resArr = dbobj.collection(collectionName).find({"user_id":id}).toArray();
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

    findAllbooks(db.getDb(),uid).
    then((resArr)=>{
        resArr.forEach(book => {
            delete book.user_id;
            delete book.lastVisitedPage;
            delete book.markedpages;
        });
        return apiResponse.successResponseWithData(res,"Successful",resArr)
    }).catch((error)=>{
        return apiResponse.ErrorResponse(res,error);
    });
}


/**
 * @description deletes from database
 * @param {object} paramObj 
 * @returns 
 */
function deletebook(paramObj) {
    return new Promise((resolve,reject)=>{
        let collection = paramObj.db.collection(paramObj.collectionName);
    resolve(collection.deleteOne(paramObj.query));
    })
}

/**
 * @description calls deletefunction for specific documents
 * @param {object} req 
 * @param {object} res 
 */
function deleteFunc(req,res) {
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let bid = new mongo.ObjectID(req.params.bid);
    let paramObj={
        db:db.getDb(),
        collectionName:collectionName,
        query:{"_id":bid,"user_id":uid}
    }
    deletebook(paramObj).then(()=>{
        return apiResponse.successResponse(res,"Deleted");
    })
    .catch((error)=>{
        return apiResponse.ErrorResponse(res,error);
    });

}



/**
 * @description fetch meaning of word using word passed and language from Google API
 * @param {string} word 
 * @param {string} lang 
 * @returns Promise with object having meanings of word
 */
function fetchMeaning(word,lang){

	return fetch("https://api.dictionaryapi.dev/api/v2/entries/"+lang+"/"+word);

}



/**
 * @description Return API response with Meaning data and message
 * @param {object} req 
 * @param {object} res 
 */
function getMeaningFunc(req,res)
{
    let word = req.params.word;
    let lang = req.params.lang;
    console.log("hello");
    fetchMeaning(word,lang)
    .then(res => res.json())
    .catch((error)=>{
        return apiResponse.ErrorResponse
    })
    .then(json => {
        let status="Successful";
        if (json.title == "No Definitions Found"){
            status = json.title
            json={}
        }
        else{
            json=json[0];
            delete json.phonetics
            delete json.word
            json.meanings.forEach((element)=>{
                element.definitions.forEach((obj)=>{
                    delete obj.synonyms
                })
            })
        }
        return apiResponse.successResponseWithData(res,status,json)
    })
    .catch((error)=>{
        return apiResponse.ErrorResponse(res,error);
    });
}

/**
 * @description Returns array of recent books
 * @param {object} dbobj 
 * @returns 
 */
function findRecentbooks(dbobj)
{
    return new Promise((resolve,reject)=>{
        let resArr = dbobj.db.collection(dbobj.collectionName).aggregate({"user_id":dbobj.id}).sort({"lastVisitedOn":-1}).limit(2).toArray();
        resolve(resArr);
    });
}

/**
 * @description Return API resonpnse data containing details of recently opened books
 * @param {object} req 
 * @param {object} res 
 */
function  getRecentFunc(req,res) {
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let dbobj={
        db:db.getDb(),
        collectionName:collectionName,
        id:uid
    }
    findRecentbooks(dbobj).
    then((resArr)=>{
        resArr.forEach(book => {
            delete book.user_id;
            delete book.lastVisitedPage;
            delete book.markedpages;
        });
        return apiResponse.successResponseWithData(res,"Successful",resArr)
    }).catch((error)=>{
        return apiResponse.ErrorResponse(res,error);
    });
    
}


/**
 * @description Updates data of book collection
 * @param {object} paramobj 
 * @returns Promise
 */
function updateBookdata(dbobj,query,newvalues) {
    return new Promise((resolve, reject) => {
        resolve(dbobj.updateOne(query, newvalues));
    })
}



/**
 * @description Updates marked pages array in database recieved from request 
 * @param {object} req 
 * @param {object} res 
 */
function updateMarkedPagesFunc(req,res)
{   
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let bid = new mongo.ObjectID(req.params.bid);
    let newData = {
        markedpages: req.body.markedpages
    }
    let newvalues = { $set: newData };
    let bookcollection = db.getDb().collection(collectionName);
    let query={_id:bid,user_id:uid};

    
    updateBookdata(bookcollection,query,newvalues)
        .then((Info) => {
            return apiResponse.ModificationResponseWithData(res, "Modified", Info.result.nModified);
        }).catch((error) => {
            return apiResponse.notFoundResponse(res,error);
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

let deleteBookFunction = [
    deleteFunc
]

let dictionaryFunction = [
    getMeaningFunc
]

let RecentBookFunction= [
    getRecentFunc
]

let MarkedPagesFunction =[
    updateMarkedPagesFunc
]

module.exports={

    bookUploadFunction,
    bookListFunction,
    deleteBookFunction,
    dictionaryFunction,
    RecentBookFunction,
    MarkedPagesFunction
}