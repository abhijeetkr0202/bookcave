const AWS = require('aws-sdk');

const ACCESS_KEY_ID = require('../../../config/index').S3_ID;
const SECRET_KEY = require('../../../config/index').S3_SECRET;
const BUCKET_NAME = require('../../../config/index').BUCKET_NAME;


const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_KEY
});


 function uploadFile(file, uid) {
    let filepath = uid + "/" + file.name;
    const params = {
        Bucket: BUCKET_NAME,
        Key: filepath,
        Body: file.data
    };
    return s3.upload(params).promise();
};


function deleteFile(filename) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename
    };
    return s3.deleteObject(params).promise();
};

module.exports={
    uploadFile,
    deleteFile,

}