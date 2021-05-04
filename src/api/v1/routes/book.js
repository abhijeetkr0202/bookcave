const router = require(".");
const passport = require("passport");


const deleteCall = require("../routes/book/deleteBook");
const listCall = require("../routes/book/listBook");
const updateCall = require("../routes/book/updateBook");
const dictionaryCall = require("../routes/book/wordDict");
const uploadCall = require("../routes/book/uploadBook");
const retrieveCall = require("../routes/book/retrieveBook");






const AUTH_MIDDLEWHERE = passport.authenticate('jwt', { session: false });




router.get('/recent', AUTH_MIDDLEWHERE, listCall.getRecentBooksRequest());

router.post('/add', AUTH_MIDDLEWHERE, uploadCall.addBookRequest());

router.post('/fetch');

router.get('/shelf', AUTH_MIDDLEWHERE, listCall.getListBooksRequest());

router.get('/shelf/:bid',AUTH_MIDDLEWHERE,retrieveCall.retriveBookRequest());

router.put('/markedpages/:bid', AUTH_MIDDLEWHERE, updateCall.updateMarkedPagesRequest());

router.put('/rename/:bid', AUTH_MIDDLEWHERE, updateCall.updateBooktitleRequest());

router.delete('/delete/:bid', AUTH_MIDDLEWHERE, deleteCall.deleteBookRequest());

router.get('/def/:word/:lang', dictionaryCall.getMeaningRequest());


module.exports = router;


