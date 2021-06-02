const bookcontroller = require("../../controller/bookcontroller");


function deleteBookRequest() {
    return bookcontroller.deleteBookFunction;
};

module.exports = { deleteBookRequest };