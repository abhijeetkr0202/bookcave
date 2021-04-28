const { body, check } = require("express-validator");
let db = require("../../app");
let collectionName = "logincred";




let validateUsername = body('username').isLength({ min: 3 }).trim().withMessage("Username is required")

let validateUseremail = body('useremail').trim().isEmail().withMessage("Valid email address required")


let validatePassword = body('password').isLength({ min: 1 }).trim().withMessage("Password must be specified")

let isDuplicateUser = body('useremail').custom((value) => {

    return db.getDb().collection(collectionName).findOne({ "useremail": value }).then((data) => {
        if (data) {
            return Promise.reject("E-mail already registered");
        }
    })
});



let validateBooktitle = body('booktitle').isLength({ min:1 }).trim().withMessage("Book title is required").withMessage("Book title must be a string")

let validatelastvisitedpage = check('lastvisitedpage');

let validatelastvisitedon = body('lastvisitedon').trim().isInt().withMessage("Integer required");

let validateArray = body('markedpages').isArray().withMessage("Array input required")





module.exports = {
    validateUsername,
    validateUseremail,
    validatePassword,
    isDuplicateUser,

    validateBooktitle,
    validatelastvisitedon,
    validatelastvisitedpage,
    validateArray
}