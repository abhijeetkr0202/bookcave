const passport = require("passport");
const router = require(".");


const deleteCall = require("./book/deleteBook");
const listCall = require("./book/listBook");
const updateCall = require("./book/updateBook");
const dictionaryCall = require("./book/wordDict");
const uploadCall = require("./book/uploadBook");
const retrieveCall = require("./book/retrieveBook");






const AUTH_MIDDLEWHERE = passport.authenticate('jwt', { session: false });




router.get('/recent', AUTH_MIDDLEWHERE, listCall.getRecentBooksRequest());

router.post('/add', AUTH_MIDDLEWHERE, uploadCall.addBookRequest());

router.post('/fetch', AUTH_MIDDLEWHERE, uploadCall.fetchBookRequest());

router.get('/shelf', AUTH_MIDDLEWHERE, listCall.getListBooksRequest());

router.get('/shelf/:bid',AUTH_MIDDLEWHERE,retrieveCall.retriveBookRequest());

router.put('/markedpages/:bid', AUTH_MIDDLEWHERE, updateCall.updateMarkedPagesRequest());

router.put('/rename/:bid', AUTH_MIDDLEWHERE, updateCall.updateBooktitleRequest());

router.delete('/delete/:bid', AUTH_MIDDLEWHERE, deleteCall.deleteBookRequest());

router.get('/def/:word/:lang', dictionaryCall.getMeaningRequest());


module.exports = router;


