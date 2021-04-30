const AWS = require('aws-sdk');

const ACCESS_KEY_ID = require('../../../config/index').S3_ID;
const SECRET_KEY = require('../../../config/index').S3_SECRET;
const BUCKET_NAME = require('../../../config/index').BUCKET_NAME;


const s3 = new AWS.S3({
    accessKeyId:ACCESS_KEY_ID,
    secretAccessKey:SECRET_KEY
});


exports.uploadFile = function (file,uid){
        let filepath=uid+"/"+file.name;
        const params = {
            Bucket: BUCKET_NAME, 
            Key: filepath, 
            Body: file.data
        };
       return s3.upload(params).promise();
};


exports.deleteFile = function (file){
    const params = {
        Bucket: BUCKET_NAME, 
        Key: file.name, 
        Body: file.data
    };
    return s3.deleteObject(params).promise();
}
