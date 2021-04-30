const bookcontroller = require("../../controller/bookcontroller");


exports.getMeaningRequest = function(){
    return bookcontroller.dictionaryFunction;
};