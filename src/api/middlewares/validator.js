const { body } = require("express-validator");
let db = require("../../app");
let collectionName = "logincred";




let validateUsername = body('username').isLength({ min: 3 }).trim().withMessage("Username is required")

let validateUseremail = body('useremail').trim().isEmail().withMessage("Valid email address required")


let validatePassword = body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified")

let isDuplicateUser = body('useremail').custom((value) => {

    return db.getDb().collection(collectionName).findOne({ "useremail": value }).then((data) => {
        if (data) {
            return Promise.reject("E-mail already registered");
        }
    })
});

module.exports = {
    validateUsername,
    validateUseremail,
    validatePassword,
    isDuplicateUser
}