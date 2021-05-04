let chai = require('chai');

let expect= chai.expect;

let dictFunction = require("../../api/v1/controller/bookcontroller").testFunctions;


describe('fetchWordMeaning',function(){
    it('Word meanings available from google dictionary api',function(){
        expect(dictFunction("test","en_US")).have.property('message').is.equal("Successful");
    })
    it('Word meaning not available from google dictionary api',function(){
        expect(dictFunction("adlfajflajfaldjfaf","en_US")).have.property('message').is.equal("No Definitions Found");
    })
})
