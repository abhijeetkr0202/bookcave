const passport = require("passport");
const router = require(".");
const usercontroller = require("../controller/usercontroller");



router.post('/signup', usercontroller.signupFunctions);

router.post('/signin', usercontroller.siginFunctions);

// router.post('/signout',usercontroller.signout);

router.get('/profile', passport.authenticate('jwt', { session: false }), usercontroller.getprofile);

router.put('/profile', passport.authenticate('jwt', { session: false }), usercontroller.editprofile);

router.delete('/profile', passport.authenticate('jwt', { session: false }), usercontroller.deleteprofile);//also delete books for that users



module.exports = router;