const bookcontroller = require("../../controller/bookcontroller");



exports.geRecentBooksRequest = function()
{
return bookcontroller.RecentBookFunction;
};


exports.getListBooksRequest = function()
{
    return bookcontroller.bookListFunction;
};

