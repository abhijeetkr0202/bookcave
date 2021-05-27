const passport = require("passport");
const express = require('express');

const router = express.Router();




const signupCall = require("./user/signupUser").signupRequest();
const signinCall = require("./user/signinUser").signinRequest();
const profileCall = require("./user/profileUser");




const AUTH_MIDDLEWHERE = passport.authenticate('jwt', { session: false });



router.post('/signup', signupCall);

router.post('/signin', signinCall);

router.get('/profile', AUTH_MIDDLEWHERE, profileCall.getProfileRequest());

router.put('/profile', AUTH_MIDDLEWHERE, profileCall.editProfileRequest());

router.delete('/profile', AUTH_MIDDLEWHERE, profileCall.deleteProfileRequest());



module.exports = {router};