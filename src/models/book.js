const Ajv = require('ajv')
const addFormats = require("ajv-formats")

const ajv = new Ajv()
addFormats(ajv)

const BookSchema = {
    type: "object",
    properties: {
        booktitle: {type: "string",maxLength:100},
        bookfilepath: {type: "string",format:"uri"},
        bookfilename: {type: "string",maxLength:100},
        lastvisitedpage: {type: "integer"},
        markedpages: {type: "array"},
        uploadedOn: {type: "number"},
        lastvisitedon: {type: "number"},

    },
    required: ["booktitle","bookfilepath","bookfilename","lastvisitedpage","markedpages","uploadedOn","lastvisitedon"]
}

const bookDataValidate = ajv.compile(BookSchema);


module.exports = {
    bookDataValidate
}