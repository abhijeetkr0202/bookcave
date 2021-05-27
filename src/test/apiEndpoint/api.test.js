const chai = require('chai');
const supertest = require('supertest');
const {describe} = require('mocha')
const {before} = require('mocha')
const {after} = require('mocha')

const {it} = require('mocha')


const {app} = require('../../app');

const request = supertest(app);


const { expect } = chai;

const {mongoURL} = require('../../config/index');
const { createMongoConn } = require('../../server');

const auth = {};





/**
 * @description stores token in auth object after signup new user
 * @param {object} auth 
 */
function signupUser(authToken) {
        return request
            .post('/v1/user/signup')
            .send({
                "username":"testuser",
                "useremail":"test@test.com",
                "password":"password"
            })
            .expect(200)
            .then((res)=> {
                // eslint-disable-next-line no-param-reassign
                authToken.token = res.body.data.token;
            })
    
}



/**
 * @description deletes info after testing 
 * @param {object} auth 
 * @returns 
 */
function deleteUser(authToken) {
    return request
            .delete('/v1/user/profile')
            .set("Authorization",`Bearer ${authToken.token}`)
            .expect(200)
        
}


describe('API TESTING',()=> {


before(()=>createMongoConn(mongoURL))

before(()=>signupUser(auth));

after(()=>deleteUser(auth));


/**
 * @description Tests User related API's
 */
describe('USER API',() => {
    
    
    describe('POST /v1/user/signin',()=>
    {
        it('should sign in successfully',(done)=>
        {
            request
            .post('/v1/user/signin')
            .type('form')
            .set('Accept', 'application/json')
            .send({
                "useremail":"testuser@test.com",
                "password":"testuserpassword"
            })
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.deep.property('data').have.property('username')
                expect(response.body).to.have.deep.property('data').have.property('useremail').to.equal("testuser@test.com")
                expect(response.body).to.have.deep.property('data').have.property('token')
                expect(response.body).to.have.deep.property('data').have.property('token_type')
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)

        it('should fail to signin',(done)=>
        {
            request
            .post('/v1/user/signin')
            .set('Accept', 'application/json')
            .send({
                "useremail":"testuser@gmail.com",
                "password":"tesadfafa"
            })
            .expect(401)
            .end((err,response)=>{
                expect(response.body).to.have.deep.property('message').to.equal("Wrong password")
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)
        
    })





    describe('GET /v1/user/profile',()=>
    {
        it('should get user details',(done)=>
        {
            request
            .get('/v1/user/profile')
            .set('Accept', 'application/json')
            .set('Authorization',`Bearer ${auth.token}`)
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.property('message').to.equal("Success")
                expect(response.body).to.have.property('data').to.have.deep.property('useremail').to.equal("test@test.com")
                expect(response.body).to.have.property('data').to.have.deep.property('username').to.equal("testuser")
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)

        it('should get return unauthroized',(done)=>
        {
            request
            .get('/v1/user/profile')
            .set('Accept', 'application/json')
            .expect(401)
            .end((err)=>{
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)
        
    })


    describe('PUT /v1/user/profile',()=>
    {
        it('should edit user details',(done)=>
        {
            request
            .put('/v1/user/profile')
            .set('Accept', 'application/json')
            .set('Authorization',`Bearer ${auth.token}`)
            .send({username:"Edited Name"})
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.property('message').to.equal("Modified")
                expect(response.body).to.have.property('nModified').to.equal(1)
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)

        it('should return unauthorized',(done)=>
        {
            request
            .put('/v1/user/profile')
            .set('Accept', 'application/json')
            .expect(401)
            .end((err)=>{
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)
        
    })

    
})



/**
 * @description Tests Dictionary API
 */
describe('DICTIONARY API',() => {
    
    describe('GET /v1/book/def/<word>/<lang>',()=>
    {
        it('should fetch definition successfully',(done)=>
        {
            request
            .get('/v1/book/def/air/en_US')
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.keys('message','data');
                expect(response.body).to.have.property('message').is.equal("Successful");
                
                
            done(err);
            })
        }).timeout(6000)

        it('should fetch no definitions',(done)=>
        {
            request
            .get('/v1/book/def/aisdfsfar/en_US')
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.keys('message','data');
                expect(response.body).to.have.property('message').is.equal("No Definitions Found");
      
            done(err);
            })
        }).timeout(6000) 
    })

})



/**
 * @description Tests Books related API's
 */
describe('BOOKS API',()=>{
    describe('List books',()=>{
        describe('GET /v1/book/recent',()=>{
            it("should return recent books",(done)=>{
            request
            .get('/v1/book/recent')
            .set('Authorization',`Bearer ${auth.token}`)
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.property('message').to.equal("Successful")
                expect(response.body).to.have.property('data')
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)

        it('should return unauthorized',(done)=>
        {
            request
            .get('/v1/book/recent')
            .set('Accept', 'application/json')
            .expect(401)
            .end((err)=>{
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)
        })


        describe('GET /v1/book/shelf',()=>{
            it("should return recent books",(done)=>{
            request
            .get('/v1/book/shelf')
            .set('Authorization',`Bearer ${auth.token}`)
            .expect(200)
            .end((err,response)=>{
                expect(response.body).to.have.property('message').to.equal("Successful")
                expect(response.body).to.have.property('data')
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)

        it('should return unauthorized',(done)=>
        {
            request
            .get('/v1/book/shelf')
            .set('Accept', 'application/json')
            .expect(401)
            .end((err)=>{
            if (err) return done(err);
            return done();
            })
        }).timeout(5000)
        })
    })
})

})


    