const router = require(".");
const usercontroller = require("../controller/usercontroller")

router.get('/user',(req,res,next)=>{
    res.status(200).json({
        message:'All users are fetched'
    });
});

router.post('/signup',usercontroller.signup);

router.post('/signin',usercontroller.sigin);
//To be done after authentication
router.post('/signout',usercontroller.signout);

router.get('/profile/:id/',usercontroller.getprofile);

router.put('/profile/:id',usercontroller.updateprofile);

router.delete('/profile/:id',usercontroller.deleteprofile);



module.exports = router;