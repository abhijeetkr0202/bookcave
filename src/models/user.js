const mongodb = require('mongodb');



exports.insertSignupData = function(dbObject){
    var collection = dbObject.db.collection(dbObject.collectionName);
    collection.insertOne(dbObject.data);
    return dbObject.data;
};

