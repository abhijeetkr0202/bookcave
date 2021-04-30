const bookcontroller = require("../../controller/bookcontroller");


exports.addBookRequest = function()
{
    return bookcontroller.bookUploadFunction;
};