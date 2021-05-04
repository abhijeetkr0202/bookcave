const bookcontroller = require("../../controller/bookcontroller");



function getRecentBooksRequest() {
    return bookcontroller.RecentBookFunction;
};


function getListBooksRequest() {
    return bookcontroller.bookListFunction;
};


module.exports = {
    getRecentBooksRequest,
    getListBooksRequest
}