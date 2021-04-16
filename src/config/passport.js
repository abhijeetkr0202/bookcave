const { ExtractJwt,Strategy } = require("passport-jwt");
const config = require(".");
const db = require('../app')


exports.applyPassportStrategy = passport=>{
    const options = {};
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = config.passport.secret;
    passport.use(
        new Strategy(options,(payload,done)=>{
        let a=db.getDb();
        logincredcollection=a.collection("logincred");
        logincredcollection.findOne({useremail:payload.useremail},(err,user)=>{
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
    );
};