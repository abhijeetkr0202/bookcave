const router = require(".");
const passport = require("passport");
const bookcontroller = require("../controller/bookcontroller");



router.get('/recent');
router.post('/add',passport.authenticate('jwt', { session: false }),bookcontroller.bookUploadFunctions);
router.post('/fetch');
router.get('/shelf');
router.get('/shelf/:bid');
// router.post('notes/:bid');
// router.put('notes/:bid');
// router.delete('notes/:bid');
router.delete('/del/:bid');
router.get('/def/:word');
module.exports = router;


//add on route used to updatebookdetails called when someone is done reading book....updates lastvisitedon and lastvisitedpage and markedpages array
