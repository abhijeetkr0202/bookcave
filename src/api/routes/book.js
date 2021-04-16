const router = require(".");



router.get('/recent/:id',(req,res,next)=>{
    res.status(200).json({
        message:'All recent books are fetched'
    });
});

router.get('recent/:uid');
router.post('add/:bid');
router.post('fetch/:bid');
router.get('/shelf/:uid');
router.get('shelf/:uid/:bid');
router.post('notes/:bid');
router.put('notes/:bid');
router.delete('notes/:bid');
router.delete('del/:bid');
router.get('def/:word');
module.exports = router;