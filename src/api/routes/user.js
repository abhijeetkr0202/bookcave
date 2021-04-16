const router = require(".");
const usercontroller = require("../controller/usercontroller")

router.get('/user',(req,res,next)=>{
    res.status(200).json({
        message:'All users are fetched'
    });
});

router.post('/signup',usercontroller.signup);
router.post('/signin',usercontroller.sigin);
router.post('signout');

router.get('profile/:id');
router.post('profile/:id');
router.put('profile/:id');
router.delete('profile/:id');


module.exports = router;