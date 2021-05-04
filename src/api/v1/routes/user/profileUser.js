const usercontroller = require("../../controller/usercontroller");


function getProfileRequest() {
    return usercontroller.getprofile;
}


function editProfileRequest() {
    return usercontroller.editprofile;
}


function deleteProfileRequest() {
    return usercontroller.deleteprofile;
}

module.exports = {
    getProfileRequest,
    editProfileRequest,
    deleteProfileRequest
}