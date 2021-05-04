let chai = require('chai');

let expect= chai.expect;

let issueJWT = require("../../config/passport").issueJWT;

let parseDatafromToken = require("../../config/passport").parseDatafromToken;


describe('issueJWT',function(){
    it('should return object with Authentication token and token type',function(){
        let data = {
            _id:"608ff6fa7e2b496d38c2346f",
            username:"TestUser",
            useremail:"testuser@gmail.com"
        };
        expect(issueJWT(data)).to.have.property('data').to.have.property('username');
        expect(issueJWT(data)).to.have.property('data').to.have.property('useremail');
        expect(issueJWT(data)).to.have.property('data').to.have.property('token_type').is.equal("Bearer");
        expect(issueJWT(data)).to.have.property('data').to.have.property('token');
    })
})


describe('parseDataFromToken',function(){
    it('should return data parsed from JWT data passed',function(){
        let token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDhmZjZmYTdlMmI0OTZkMzhjMjM0NmYiLCJpYXQiOjE2MjAwNDc2ODIuNDE0LCJleHAiOjE2MjAxMzQwODIuNDE0fQ._VefCQXsOtLXWegwjgzE9GNQFnRzSmGrVkw55CR8ZEQ";
        expect(parseDatafromToken(token)).to.have.keys('_id','iat','exp')
    })
})