const router = require(".");



router.get('/recent/:id',(req,res,next)=>{
    res.status(200).json({
        message:'All recent books are fetched'
    });
});
module.exports = router;