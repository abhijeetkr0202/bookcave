const chai = require('chai');
const {describe} = require('mocha')
const {it} = require('mocha')

const {expect} = chai;

const {issueJWT} = require("../../api/helpers/jwtUtility");

const {parseDatafromToken} = require("../../api/helpers/jwtUtility");


describe('FUNCTIONS FOR JWT FEATURES',()=>{
    describe('issueJWT',()=> {
        it('should return object with Authentication token and token type',()=> {
            const data = {
                _id:"608ff6fa7e2b496d38c2346f",
                username:"TestUser",
                useremail:"testuser@gmail.com"
            };
            expect(issueJWT(data)).to.have.property('data').to.have.property('username').is.equal("TestUser");
            expect(issueJWT(data)).to.have.property('data').to.have.property('useremail').is.equal("testuser@gmail.com");
            expect(issueJWT(data)).to.have.property('data').to.have.property('token_type').is.equal("Bearer");
            expect(issueJWT(data)).to.have.property('data').to.have.property('token');
        })
    })
    
    
    describe('parseDataFromToken',()=> {
        it('should return data parsed from JWT data passed',()=> {
            const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDhmZjZmYTdlMmI0OTZkMzhjMjM0NmYiLCJpYXQiOjE2MjAwNDc2ODIuNDE0LCJleHAiOjE2MjAxMzQwODIuNDE0fQ._VefCQXsOtLXWegwjgzE9GNQFnRzSmGrVkw55CR8ZEQ";
            expect(parseDatafromToken(token)).to.have.keys('_id','iat','exp');
            expect(parseDatafromToken(token)).to.have.property('_id').is.equal("608ff6fa7e2b496d38c2346f");
        })
    })
    
})

