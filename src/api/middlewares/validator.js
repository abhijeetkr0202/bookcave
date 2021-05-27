const { body, check } = require("express-validator");


const db = require("../../server");

const collectionName = "logincred";




const validateUsername = body('username').isLength({ min: 3 }).trim().withMessage("Username is required")

const validateUseremail = body('useremail').trim().isEmail().withMessage("Valid email address required")


const validatePassword = body('password').isLength({ min: 1 }).trim().withMessage("Password must be specified")

const isDuplicateUser = body('useremail').custom((value) => db.getDb().collection(collectionName).findOne({ "useremail": value }).then((data) => {
        if (data) {
            return Promise.reject(new Error("E-mail already registered"));
        }
        return true;
    }));



const validateBooktitle = body('booktitle').isLength({ min:1 }).trim().withMessage("Book title is required").withMessage("Book title must be a string")

const validatelastvisitedpage = body('lastvisitedpage').trim().isNumeric().withMessage("Integer Required");

const validatelastvisitedon = body('lastvisitedon').trim().isNumeric().withMessage("Integer required");

const validateArray = body('markedpages').isArray().withMessage("Array input required")


const validateFile = check('bookfile').custom((value, {req})=> {
    if (req.files.bookfile.name.match("^.*.(pdf|PDF|epub|EPUB)$"))
    return true;
    return Promise.reject(new Error("Only PDF files allowed"));
});


const validateUrl = check('filelink').custom((value,{req}) => {
    if(req.body.filelink.indexOf("http://",0) === 0 || req.body.filelink.indexOf("https://",0) === 0) {
        return true;
     }
     return Promise.reject(new Error("Invalid url"));
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