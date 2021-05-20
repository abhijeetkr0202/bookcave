const { body, check } = require("express-validator");


let db = require("../../app");
let collectionName = "logincred";




let validateUsername = body('username').isLength({ min: 3 }).trim().withMessage("Username is required")

let validateUseremail = body('useremail').trim().isEmail().withMessage("Valid email address required")


let validatePassword = body('password').isLength({ min: 1 }).trim().withMessage("Password must be specified")

let isDuplicateUser = body('useremail').custom(function (value) {

    return db.getDb().collection(collectionName).findOne({ "useremail": value }).then((data) => {
        if (data) {
            return Promise.reject("E-mail already registered");
        }
    })
});



let validateBooktitle = body('booktitle').isLength({ min:1 }).trim().withMessage("Book title is required").withMessage("Book title must be a string")

let validatelastvisitedpage = body('lastvisitedpage').trim().isNumeric().withMessage("Integer Required");

let validatelastvisitedon = body('lastvisitedon').trim().isNumeric().withMessage("Integer required");

let validateArray = body('markedpages').isArray().withMessage("Array input required")


let validateFile = check('bookfile').custom(function (value, {req}){
    if (req.files.bookfile.name.match("^.*\.(pdf|PDF|epub|EPUB)$"))
    return true;
    else 
    return Promise.reject("Only PDF files allowed");
});


let validateUrl = check('filelink').custom(function (value,{req}) {
    if(req.body.filelink.indexOf("http://",0) == 0 || req.body.filelink.indexOf("https://",0) == 0) {
        return true;
     }
     return Promise.reject("Invalid url");
})



module.exports = {
    validateUsername,
    validateUseremail,
    validatePassword,
    isDuplicateUser,

    validateFile,
    validateBooktitle,
    validatelastvisitedon,
    validatelastvisitedpage,
    validateArray,
    validateUrl
}