const bookcontroller = require("../../controller/bookcontroller");


function addBookRequest() {
    return bookcontroller.bookUploadFunction;
};


module.exports = {
    addBookRequest
}