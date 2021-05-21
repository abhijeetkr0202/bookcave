const Ajv = require('ajv')
const addFormats = require("ajv-formats")

const ajv = new Ajv()
addFormats(ajv)

const UserSchema = {
    type: "object",
    properties: {
        username: {type: "string",maxLength:20},
        useremail: {type: "string",maxLength:30,format:"email"},
        password: {type: "string"}

    },
    required: ["username","useremail","password"]
}

const userDataValidate = ajv.compile(UserSchema);


module.exports = {
    userDataValidate
}