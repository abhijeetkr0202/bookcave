const mongodb = require('mongodb');
let db = require('../app');


function userSchemaValidator(){
    console.log("userSchema validation is here")
    db.createCollection("logincred",{
        validator: {
            $jsonSchema: {
                bsonType:"object",
                required:["username","useremail","password"],
                properties:{
                    username:{
                        bsonType:"string",
                        description:"String allowed and is required"
                    },
                    useremail:{
                        bsonType:"string",
                        description:"String allowed and is required"
                    },
                    password:{
                        bsonType:"bindata",
                        description:"Hashed password"
                    }
                }
            }
        }
    })
}

exports.module=userSchemaValidator;