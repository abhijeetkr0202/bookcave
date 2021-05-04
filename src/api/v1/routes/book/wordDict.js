const bookcontroller = require("../../controller/bookcontroller");


function getMeaningRequest() {
    return bookcontroller.dictionaryFunction;
};

module.exports = {
    getMeaningRequest
}