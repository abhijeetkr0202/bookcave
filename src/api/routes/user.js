const passport = require("passport");
const router = require(".");
const usercontroller = require("../controller/usercontroller");
router.get('/user',(req,res,next)=>{
    res.status(200).json({
        message:'All users are fetched'
    });
});

router.post('/signup',usercontroller.signup);

router.post('/signin',usercontroller.sigin);

// router.post('/signout',usercontroller.signout);

router.get('/profile/:id/',passport.authenticate('jwt', { session: false }),usercontroller.getprofile);

router.put('/profile/:id',passport.authenticate('jwt', { session: false }),usercontroller.updateprofile);

router.delete('/profile/:id',passport.authenticate('jwt', { session: false }),usercontroller.deleteprofile);



module.exports = router;