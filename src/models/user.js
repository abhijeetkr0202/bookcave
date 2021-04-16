const mongodb = require('mongodb');


// function for inserting using mongodb native driver
// function that validates data and then insert it into User model
// then export function like 
// module.exports  = 

exports.insertSignupData = function(db,collectionName,data){
    var collection = db.collection(collectionName);
    collection.insertOne(data);
};