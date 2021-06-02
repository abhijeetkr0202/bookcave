const bookcontroller = require("../../controller/bookcontroller");



function retriveBookRequest() {
    return bookcontroller.RetrieveBookFunction;
};



module.exports = {
    retriveBookRequest
}