const bookcontroller = require("../../controller/bookcontroller");



exports.updateMarkedPagesRequest = function(){
    return bookcontroller.MarkedPagesFunction;
};


exports.updateBooktitleRequest = function(){
    return bookcontroller.RenameBookFunction;
};