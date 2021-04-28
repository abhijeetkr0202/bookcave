const router = require(".");
const passport = require("passport");


const bookcontroller = require("../controller/bookcontroller");



const AUTH_MIDDLEWHERE =passport.authenticate('jwt', { session: false });




router.get('/recent', AUTH_MIDDLEWHERE, bookcontroller.RecentBookFunction);

router.post('/add', AUTH_MIDDLEWHERE, bookcontroller.bookUploadFunction);

router.post('/fetch');

router.get('/shelf', AUTH_MIDDLEWHERE, bookcontroller.bookListFunction);

router.get('/shelf/:bid');

router.put('/markedpages/:bid', AUTH_MIDDLEWHERE, bookcontroller.MarkedPagesFunction);

router.delete('/delete/:bid', AUTH_MIDDLEWHERE, bookcontroller.deleteBookFunction);

router.get('/def/:word/:lang', bookcontroller.dictionaryFunction);


module.exports = router;


