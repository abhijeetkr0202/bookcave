const mongodb = require('mongodb');




exports.insertBookData = function(dbObject){
    let collection = dbObject.db.collection(dbObject.collectionName);
    collection.insertOne(dbObject.data);
    return dbObject.data;
};