const usercontroller = require("../../controller/usercontroller");



exports.getProfileRequest = function ()
{
    return usercontroller.getprofile;
}


exports.editProfileRequest = function ()
{
    return usercontroller.editprofile;
}


exports.deleteProfileRequest = function()
{
    return usercontroller.deleteprofile;
}