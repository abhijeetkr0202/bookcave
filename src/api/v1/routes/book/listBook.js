const bookcontroller = require("../../controller/bookcontroller");



exports.getRecentBooksRequest = function()
{
return bookcontroller.RecentBookFunction;
};


exports.getListBooksRequest = function()
{
    return bookcontroller.bookListFunction;
};

