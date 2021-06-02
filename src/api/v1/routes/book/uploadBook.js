const bookcontroller = require("../../controller/bookcontroller");


function addBookRequest() {
    return bookcontroller.bookUploadFunction;
};



function fetchBookRequest(){
    return bookcontroller.bookFetchFunction;
}

module.exports = {
    addBookRequest,
    fetchBookRequest
}