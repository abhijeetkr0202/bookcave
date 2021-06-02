const usercontroller = require("../../controller/usercontroller");



function signinRequest()
{
    return usercontroller.signinFunctions;
}

module.exports={
    signinRequest
}