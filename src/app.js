const express = require('express');
const passport = require('passport');

const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const {pinolog} = require('./api/middlewares/logger');
const {logger} = require("./api/middlewares/logger");

const {passportFunction} = require('./config/passport');



const apiRouterV1 = require('./api/v1/routes/api');



passportFunction(passport);
app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(logger);
app.use('/v1', apiRouterV1);
            






module.exports = {app,pinolog}

