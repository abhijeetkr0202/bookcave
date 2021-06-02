const { ExtractJwt, Strategy } = require("passport-jwt");
const mongo = require('mongodb');


const config = require(".");
const db = require('../server');



// options defined for passport-jwt
const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.passport.secret;


function passportFunction(passport){
    passport.use(new Strategy(options, (payload, done) => {
        const logincredcollection = db.getDb().collection("logincred");
        const objId = new mongo.ObjectID(payload._id);
    
        logincredcollection.findOne({ _id: objId })
            .then((user) => {
                if (user) {
                    return done(null, {
                        useremail: user.useremail,
                        _id: user._id
                    });
                }
                return done(null, false);
            }).catch((err) => done(err, false))
    
    
    })
    )
};

module.exports = {passportFunction}; 