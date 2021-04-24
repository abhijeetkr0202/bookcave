const router = require(".");
const passport = require("passport");
const bookcontroller = require("../controller/bookcontroller");



router.get('/recent', passport.authenticate('jwt', { session: false }), bookcontroller.RecentBookFunction);//last visited on se sort and then pick last two
router.post('/add', passport.authenticate('jwt', { session: false }), bookcontroller.bookUploadFunction);
router.post('/fetch');
router.get('/shelf', passport.authenticate('jwt', { session: false }), bookcontroller.bookListFunction);
router.get('/shelf/:bid');
router.put('/markedpages/:bid', passport.authenticate('jwt', { session: false }), bookcontroller.MarkedPagesFunction);
router.delete('/delete/:bid', passport.authenticate('jwt', { session: false }), bookcontroller.deleteBookFunction);
router.get('/def/:word/:lang', bookcontroller.dictionaryFunction);
module.exports = router;


//add on route used to updatebookdetails called when someone is done reading book....updates lastvisitedon and lastvisitedpage and markedpages array
