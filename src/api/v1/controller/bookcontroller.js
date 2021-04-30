const { validationResult } = require("express-validator");
const mongo = require('mongodb');
const fetch = require('node-fetch');


const apiResponse = require('../../helpers/apiResponse');
let db = require("../../../app")
const passportFunctions = require("../../../config/passport");
const bookValidator = require("../../middlewares/validator");
const awsUploader = require("../services/storageAWS").uploadFile;




let userCollection = "logincred";
let bookCollection = "books";






/**
 * 
 * @description Add books to database
 * @param {object} req 
 * @param {object} res 
 * @returns apiResponse
 */
function addbookFunc(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty() || !req.files) {
        return apiResponse.validationErrorWithData(res, "Validation Error or missing file", errors.array());

    }
        
        let bookfile = req.files.bookfile;
        awsUploader(bookfile)
            .then((awsdata) => {

                let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
                let bookData = {
                    "booktitle": bookfile.name,
                    "bookfilepath": awsdata.Location,
                    "lastvisitedpage": 0,
                    "markedpages": [],
                    "user_id": uid,
                    "uploadedOn": Date.now(),
                    "lastvisitedon": Date.now()
                }
                let dataObject = {
                    db: db.getDb(),
                    collectionName: bookCollection,
                    data: bookData
                }

                return Promise.resolve(insertBookData(dataObject));
            })
            .then((data) => {
                return apiResponse.successResponse(res, "Uploaded");
            }).catch((error) => {
                return apiResponse.ErrorResponse(res, error);
            });

    
}




/**
 * @description Functions that inserts book data in database
 * @param {object} dbObject 
 * @returns object with book data
 */
function insertBookData(dbObject) {
    let collection = dbObject.db.collection(dbObject.collectionName);
    collection.insertOne(dbObject.data);
    return dbObject.data;
};







/**
 * @description Returns api response with list of books for logged in user
 * @param {object} req 
 * @param {object} res 
 */
function listbookFunc(req, res) {
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    findAllbooks(db.getDb(), uid).
        then((resArr) => {
            resArr.forEach(book => {
                delete book.user_id;
                delete book.lastvisitedpage;
                delete book.markedpages;
            });
            return apiResponse.successResponseWithData(res, "Successful", resArr)
        }).catch((error) => {
            return apiResponse.ErrorResponse(res, error);
        });
}




/**
 * @description return array of books from db using user id
 * @param {object} dbobj 
 * @param {mongo.ObjectID} id 
 * @returns 
 */
function findAllbooks(dbobj, id) {
    return new Promise((resolve, reject) => {
        let resArr = dbobj.collection(bookCollection).find({ "user_id": id }, { "user_id": 0, "markedpages": 0, "lastvisitedpage": 0 }).toArray();
        resolve(resArr);
    });
}





/**
 * @description calls deletefunction for specific documents
 * @param {object} req 
 * @param {object} res 
 */
function deleteFunc(req, res) {
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let bid = new mongo.ObjectID(req.params.bid);
    let paramObj = {
        db: db.getDb(),
        collectionName: bookCollection,
        query: { "_id": bid, "user_id": uid }
    }
    deletebook(paramObj).then(() => {
        return apiResponse.successResponse(res, "Deleted");
    })
        .catch((error) => {
            return apiResponse.ErrorResponse(res, error);
        });

}




/**
 * @description deletes from database
 * @param {object} paramObj 
 * @returns 
 */
function deletebook(paramObj) {
    return new Promise((resolve, reject) => {
        let collection = paramObj.db.collection(paramObj.collectionName);
        resolve(collection.deleteOne(paramObj.query));
    })
}








/**
 * @description Return API response with Meaning data and message
 * @param {object} req 
 * @param {object} res 
 */
function getMeaningFunc(req, res) {
    let word = req.params.word;
    let lang = req.params.lang;
    fetchMeaning(word, lang)
        .then(res => res.json())
        .catch((error) => {
            return apiResponse.ErrorResponse
        })
        .then(json => {
            let status = "Successful";
            if (json.title == "No Definitions Found") {
                status = json.title
                json = {}
            }
            else {
                json = json[0];
                delete json.phonetics
                delete json.word
                json.meanings.forEach((element) => {
                    element.definitions.forEach((obj) => {
                        delete obj.synonyms
                    })
                })
            }
            return apiResponse.successResponseWithData(res, status, json)
        })
        .catch((error) => {
            return apiResponse.ErrorResponse(res, error);
        });
}







/**
 * @description fetch meaning of word using word passed and language from Google API
 * @param {string} word 
 * @param {string} lang 
 * @returns Promise with object having meanings of word
 */
function fetchMeaning(word, lang) {

    return fetch("https://api.dictionaryapi.dev/api/v2/entries/" + lang + "/" + word);

}






/**
 * @description Return API resonpnse data containing details of recently opened books
 * @param {object} req 
 * @param {object} res 
 */
function getRecentFunc(req, res) {
    let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    let dbobj = {
        db: db.getDb(),
        collectionName: bookCollection,
        id: uid
    }
    findRecentbooks(dbobj)
        .then((resArr) => {
            resArr.forEach(book => {
                delete book.user_id;
                delete book.lastvisitedpage;
                delete book.markedpages;
            });
            return apiResponse.successResponseWithData(res, "Successful", resArr)
        }).catch((error) => {
            return apiResponse.ErrorResponse(res, error);
        });

}




/**
 * @description Returns array of recent books
 * @param {object} dbobj 
 * @returns 
 */
function findRecentbooks(dbobj) {
    return new Promise((resolve, reject) => {
        let resArr = dbobj.db.collection(dbobj.collectionName).find({ "user_id": dbobj.id }, { "user_id": 0, "markedpages": 0, "lastvisitedpage": 0 }).sort({ "lastvisitedon": -1 }).limit(2).toArray();
        resolve(resArr);
    });
}





/**
 * @description Updates marked pages array in database recieved from request 
 * @param {object} req 
 * @param {object} res 
 */
function updateMarkedPagesFunc(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
    }
    else {
        let uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
        let bid = new mongo.ObjectID(req.params.bid);
        let newData = {
            markedpages: req.body.markedpages
        }
        let newvalues = { $set: newData };
        let bookcollection = db.getDb().collection(bookCollection);
        let query = { _id: bid, user_id: uid };


        updateBookdata(bookcollection, query, newvalues)
            .then((Info) => {
                return apiResponse.ModificationResponseWithData(res, "Modified", Info.result.nModified);
            }).catch((error) => {
                return apiResponse.notFoundResponse(res, error);
            });
    }
}



/**
 * @description Updates data of book collection
 * @param {object} paramobj 
 * @returns Promise
 */
function updateBookdata(dbobj, query, newvalues) {
    return new Promise((resolve, reject) => {
        resolve(dbobj.updateOne(query, newvalues));
    })
}


// Arrays to be exported to route functions
let bookUploadFunction = [
    bookValidator.validateFile,
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

let RecentBookFunction = [
    getRecentFunc
]

let MarkedPagesFunction = [
    bookValidator.validateArray,
    updateMarkedPagesFunc
]

module.exports = {

    bookUploadFunction,
    bookListFunction,
    deleteBookFunction,
    dictionaryFunction,
    RecentBookFunction,
    MarkedPagesFunction
}