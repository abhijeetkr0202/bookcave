const router = require(".");
const passport = require("passport");
const bookcontroller = require("../controller/bookcontroller");



router.get('/recent');//last visited on se sort and then pick last two
router.post('/add',passport.authenticate('jwt', { session: false }),bookcontroller.bookUploadFunction);
router.post('/fetch');
router.get('/shelf',passport.authenticate('jwt',{ session: false }),bookcontroller.bookListFunction);
router.get('/shelf/:bid');
// router.post('notes/:bid');
// router.put('notes/:bid');
// router.delete('notes/:bid');
router.delete('/del/:bid');
router.get('/def/:word');
module.exports = router;


//add on route used to updatebookdetails called when someone is done reading book....updates lastvisitedon and lastvisitedpage and markedpages array
