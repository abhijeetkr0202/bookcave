const mongodb = require('mongodb');
let db = require('../app');


exports.userSchemaValidator = function (){
    db.getDb().createCollection("logincred",{
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
