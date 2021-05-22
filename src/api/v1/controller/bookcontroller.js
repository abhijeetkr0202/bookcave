const { validationResult } = require("express-validator");
const mongo = require('mongodb');
const fetch = require('node-fetch');
const FileType = require('file-type');


const apiResponse = require('../../helpers/apiResponse');
const db = require("../../../app");
const passportFunctions = require("../../../config/passport");
const bookValidator = require("../../middlewares/validator");
const bookSchemaValidate = require("../../../models/book").bookDataValidate;

const awsUpload = require("../services/storageAWS").uploadFile;
const awsDelete = require("../services/storageAWS").deleteFile;



const bookCollection = "books";





/**
 * 
 * @param {string} url 
 * @returns fetch file from url
 */
 function fetchFromUrl(url) {
    return Promise.resolve(fetch(url));
}

/**
 * 
 * @param {buffer array} filebuffer 
 * @returns filetype 
 */
function checkFileType(filebuffer) {
    return Promise.resolve(FileType.fromBuffer(filebuffer))
}



/**
 * @description creates indexes in DB
 * @param {object} dbObject 
 * @returns 
 */
 function createBookIndex(dbObject){
    return dbObject.db.createIndex(dbObject.collectionName,dbObject.indexField);
}


/**
 * @description Functions that inserts book data in database
 * @param {object} dbObject 
 * @returns object with book data
 */
function insertBookData(dbObject) {
    const collection = dbObject.db.collection(dbObject.collectionName);
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
function addbookFunc(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty() || !req.files) {
        return apiResponse.validationErrorWithData(res, "Validation Error or missing file", errors.array());

    }

    const {bookfile} = req.files;
    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    awsUpload(bookfile, uid)
        .then((awsdata) => {
            if (typeof req.body.booktitle === 'undefined') {
                req.body.booktitle = bookfile.name.replace(/(.pdf|.PDF|.epub|.EPUB)/, '');
            }
            const bookData = {
                "booktitle": req.body.booktitle,
                "bookfilepath": awsdata.Location,
                "bookfilename": bookfile.name,
                "lastvisitedpage": 0,
                "markedpages": [],
                "user_id": uid,
                "uploadedOn": Date.now(),
                "lastvisitedon": Date.now()
            }
            if(!bookSchemaValidate(bookData))
            {
                throw new Error("Book Data Failed Schema Validation")
            }
            const dataObject = {
                db: db.getDb(),
                collectionName: bookCollection,
                data: bookData
            }

      
            const bookIndexData = {
                db: db.getDb(),
                collectionName:bookCollection,
                indexField:[[bookData.user_id,1],[bookData.bookfilename,1]]
            }

            return Promise.all([insertBookData(dataObject),createBookIndex(bookIndexData)]);
        })
        .then(function (data) {
            return apiResponse.successResponse(res, "Uploaded");
        }).catch(function (error) {
            return apiResponse.ErrorResponse(res, error.message);
        });


}




function fetchAddBookFunc(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error or incorrect file link", errors.array());

    }


    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);

    fetchFromUrl(req.body.filelink)
    .then(function (response) {
        return Promise.resolve(response.buffer())
    })
    .catch(function (error) {
        return apiResponse.ErrorResponse(res,"File not found");
    })
    .then(function (filebuffer) {
        Promise.all([filebuffer, checkFileType(filebuffer)])
            .then(function (values) 
            {
                if (values[1].ext === 'pdf' || values[1].ext === 'epub') 
                {
                    const file = 
                    {
                        name: `${req.body.booktitle}.${values[1].ext}`,
                        data: values[0]
                    }

                    return Promise.resolve(file);
                }
                throw new Error("Invalid File")
            })
            .then(function (file) {
                return Promise.resolve(awsUpload(file, uid))
            })
            .catch(function (error) {
                return apiResponse.ErrorResponse(res,error.message);
            })
            .then((awsdata) => {
                const bookData = {
                    "booktitle": req.body.booktitle,
                    "bookfilepath": awsdata.Location,
                    "bookfilename": req.body.booktitle,
                    "lastvisitedpage": 0,
                    "markedpages": [],
                    "user_id": uid,
                    "uploadedOn": Date.now(),
                    "lastvisitedon": Date.now()
                    }
                    if(!bookSchemaValidate)
                    {
                        throw new Error("Book Data Failed Schema Validation")
                    }
                    const dataObject = {
                        db: db.getDb(),
                        collectionName: bookCollection,
                        data: bookData
                    }

                    return Promise.resolve(insertBookData(dataObject));
            })
            .then(function (data) {
                return apiResponse.successResponse(res, "Uploaded");
            }).catch(function (error) {
                return apiResponse.ErrorResponse(res, error.message);
            });
        })
        .catch(function (error) {
            return apiResponse.ErrorResponse(res,error.message);
        })

}





/**
 * @description return array of books from db using user id
 * @param {object} dbobj 
 * @param {mongo.ObjectID} id 
 * @returns 
 */
 function findAllbooks(params) {
    return new Promise((resolve) => {
        const resArr = params.db.collection(params.collectionName).find(params.query, params.hide_data).toArray();
        resolve(resArr);
    });
}




/**
 * @description Returns api response with list of books for logged in user
 * @param {object} req 
 * @param {object} res 
 */
function listbookFunc(req, res) {
    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const params = {
        db: db.getDb(),
        collectionName: bookCollection,
        query: { "user_id": uid },
        hide_data: { "user_id": 0, "markedpages": 0, "lastvisitedpage": 0 }
    }
    findAllbooks(params).
        then((resArr) => {
            resArr.forEach(book => {
                delete book.user_id;
                delete book.lastvisitedpage;
                delete book.markedpages;
            });
            return apiResponse.successResponseWithData(res, "Successful", resArr)
        }).catch(function (error){
            return apiResponse.ErrorResponse(res, error.message);
        });
}



/**
 * @description returns array 
 * @param {object} paramobj 
 * @returns Promise with data
 */
 function getFilePath(paramobj) {
    const filepath = paramobj.db.collection(paramobj.collectionName).find(paramobj.query).toArray();
    return Promise.resolve(filepath);
}

















/**
 * @description deletes from database
 * @param {object} paramObj 
 * @returns 
 */
function deletebook(paramObj) {
    return new Promise((resolve, reject) => {
        const collection = paramObj.db.collection(paramObj.collectionName);
        resolve(collection.deleteOne(paramObj.query));
    })
}







/**
 * @description calls deletefunction for specific documents
 * @param {object} req 
 * @param {object} res 
 */
function deleteFunc(req, res) {
    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const bid = new mongo.ObjectID(req.params.bid);
    const paramObj = {
        db: db.getDb(),
        collectionName: bookCollection,
        query: { "_id": bid, "user_id": uid }
    }

    getFilePath(paramObj)
        .then(function (data) {
            const filepath = `${paramObj.query.user_id  }/${  data[0].bookfilename}`;
            return Promise.resolve(filepath);
        })
        .then(function (filepathvalue) {
            awsDelete(filepathvalue)
                .then(function () {
                    return Promise.resolve(deletebook(paramObj));
                })
                .catch(function (error) {
                    return apiResponse.ErrorResponse(res, error.response);
                })
                .then(function () {
                    return apiResponse.successResponse(res, "Deleted");
                })
        }).catch(function (err) {
            return apiResponse.notFoundResponse(res, "Not found");
        })

    

    }


/**
 * @description fetch meaning of word using word passed and language from Google API
 * @param {string} word 
 * @param {string} lang 
 * @returns Promise with object having meanings of word
 */
 function fetchMeaning(word, lang) {

    return fetch(`https://api.dictionaryapi.dev/api/v2/entries/${  lang  }/${  word}`);

}





/**
 * @description Return API response with Meaning data and message
 * @param {object} req 
 * @param {object} res 
 */
 function getMeaningFunc(req, res) {
    const word = req.params.word;
    const lang = req.params.lang;
    fetchMeaning(word, lang)
        .then(response => response.json())
        .catch(function(error){
            return apiResponse.ErrorResponse(res, error);
        })
        .then(function (json) {
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
        .catch(function(error) {
            return apiResponse.ErrorResponse(res, error.message);
        });
}






/**
 * @description Returns array of recent books
 * @param {object} dbobj 
 * @returns 
 */
 function findRecentbooks(dbobj) {
    return new Promise((resolve, reject) => {
        const resArr = dbobj.db.collection(dbobj.collectionName).find({ "user_id": dbobj.id }, { "user_id": 0, "markedpages": 0, "lastvisitedpage": 0 }).sort({ "lastvisitedon": -1 }).limit(2).toArray();
        resolve(resArr);
    });
}








/**
 * @description Return API resonpnse data containing details of recently opened books
 * @param {object} req 
 * @param {object} res 
 */
function getRecentFunc(req, res) {
    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const dbobj = {
        db: db.getDb(),
        collectionName: bookCollection,
        id: uid
    }
    findRecentbooks(dbobj)
        .then(function (resArr) {
            resArr.forEach(book => {
                delete book.user_id;
                delete book.lastvisitedpage;
                delete book.markedpages;
            });
            return apiResponse.successResponseWithData(res, "Successful", resArr)
        }).catch(function (error) {
            return apiResponse.ErrorResponse(res, error.message);
        });

}




/**
 * @description Updates data of book collection
 * @param {object} paramobj 
 * @returns Promise
 */
 function updateBookdata(dbobj, query, newvalues) {
    return new Promise(function (resolve, reject) {
        resolve(dbobj.updateOne(query, newvalues));
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
    
        const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
        const bid = new mongo.ObjectID(req.params.bid);
        const newData = {
            markedpages: req.body.markedpages
        }
        const newvalues = { $set: newData };
        const bookcollection = db.getDb().collection(bookCollection);
        const query = { _id: bid, user_id: uid };


        updateBookdata(bookcollection, query, newvalues)
            .then(function (Info) {
                return apiResponse.ModificationResponseWithData(res, "Modified", Info.result.nModified);
            }).catch(function (error){
                return apiResponse.notFoundResponse(res, error.message);
            });
    
}




/**
 * @description Renames booktitle in database recieved from request 
 * @param {object} req 
 * @param {object} res 
 */
function updateBooktitleFunc(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
    }
    
        const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
        const bid = new mongo.ObjectID(req.params.bid);
        const newData = {
            booktitle: req.body.booktitle
        }
        const newvalues = { $set: newData };
        const bookcollection = db.getDb().collection(bookCollection);
        const query = { _id: bid, user_id: uid };


        updateBookdata(bookcollection, query, newvalues)
            .then(function (Info) {
                return apiResponse.ModificationResponseWithData(res, "Modified", Info.result.nModified);
            }).catch(function (error){
                return apiResponse.notFoundResponse(res, error.message);
            });
    
}


/**
 * 
 * @param {object} params 
 * @returns book details using param
 */
function getBookDetail(params) {
    return new Promise(function (resolve, reject) {
        const res = params.db.collection(params.collectionName).findOne(params.query, params.hide_data);
        resolve(res);
    });
}




/**
 * 
 * @description retrieves books from database
 * @param {object} req 
 * @param {object} res 
 */
function retrieveBookFunc(req, res) {
    const uid = new mongo.ObjectID(passportFunctions.parseDatafromToken(req.get('Authorization'))._id);
    const bid = new mongo.ObjectID(req.params.bid);
    const params = {
        db: db.getDb(),
        query: { "_id": bid, "user_id": uid },
        hide_data: { "user_id": 0 },
        collectionName: bookCollection
    };
    getBookDetail(params)
        .then(function (bookData) {
            return apiResponse.successResponseWithData(res, "successful", bookData);
        }).catch(function (error) {
            return apiResponse.notFoundResponse(res, error.message);
        });

}













// Arrays to be exported to route functions
const bookUploadFunction = [
    bookValidator.validateFile,
    addbookFunc
];

const bookListFunction = [
    listbookFunc
];

const deleteBookFunction = [
    deleteFunc
]

const dictionaryFunction = [
    getMeaningFunc
]

const RecentBookFunction = [
    getRecentFunc
]

const MarkedPagesFunction = [
    bookValidator.validateArray,
    updateMarkedPagesFunc
]

const RenameBookFunction = [
    bookValidator.validateBooktitle,
    updateBooktitleFunc
]

const RetrieveBookFunction = [
    retrieveBookFunc
]

const bookFetchFunction = [
    bookValidator.validateUrl,
    fetchAddBookFunc
]
module.exports = {

    bookUploadFunction,
    bookListFunction,
    deleteBookFunction,
    dictionaryFunction,
    RecentBookFunction,
    MarkedPagesFunction,
    RenameBookFunction,
    RetrieveBookFunction,
    bookFetchFunction
}