
// let app = require('../../app');
// let request = require('supertest');
// let expect = require('chai').expect;



// const testCredentials = {
//     username:"testUser",
//     useremail:"integrationtest@gmail.com",
//     password:"testPassword"
// }


// let authenticatedUser = request.agent(app);

// before(function(done){
//     authenticatedUser
//     .post('/v1/user/signup')
//     .send(testCredentials)
//     .end(function(err,response){
//         expect(response.statusCode).to.equal(200);
//     });
// });


// describe('/v1/user/profile', function(done){
    
//       it('should return a 200 response if the user is logged in', function(done){
//         authenticatedUser.get('/v1/user/profile')
//         .expect(200, done);
//       });
//     });