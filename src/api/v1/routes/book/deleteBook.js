const bookcontroller = require("../../controller/bookcontroller");


exports.deleteBookRequest = function ()
{
    return bookcontroller.deleteBookFunction;
};