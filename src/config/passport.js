const { ExtractJwt,Strategy } = require("passport-jwt");
const config = require(".");
const db = require('../app')
const mongo = require('mongodb');

const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = config.passport.secret;

const strategy = new Strategy(options,(payload,done)=>{
    let a=db.getDb();
    logincredcollection=a.collection("logincred");
    var o_id = new mongo.ObjectID(payload._id);
    console.log(o_id);
    logincredcollection.findOne({_id:o_id},(err,user)=>{
        if (err) return done(err,false);
        if (user){
            return done(null,{
                useremail:user.useremail,
                _id:user._id
            });
        }
        return done(null,false);
    });
    })

exports.applyPassportStrategy = passport=>{
    
    passport.use(strategy);
};