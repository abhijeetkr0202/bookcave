const usercontroller = require("../../controller/usercontroller");



function signupRequest() {
    return usercontroller.signupFunctions;
}

module.exports = {
    signupRequest
}

