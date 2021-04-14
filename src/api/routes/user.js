const router = require(".");


router.get('/user',(req,res,next)=>{
    res.status(200).json({
        message:'All users are fetched'
    });
});

module.exports = router;