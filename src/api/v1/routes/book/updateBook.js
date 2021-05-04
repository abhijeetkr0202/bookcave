const bookcontroller = require("../../controller/bookcontroller");



function updateMarkedPagesRequest() {
    return bookcontroller.MarkedPagesFunction;
};


function updateBooktitleRequest() {
    return bookcontroller.RenameBookFunction;
};


module.exports = {
    updateBooktitleRequest,
    updateMarkedPagesRequest
}