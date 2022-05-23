const request = require('supertest');
const app = require('../server');

describe('Comments API', () => {
  it('GET /api/comments -> array of all comments', () => {
    return request(app)
      .get('/api/comments')
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            instant: expect.any(String),
            // replyToId: expect.any(Number), // this could be null or a number
            text: expect.any(String),
            userId: expect.any(Number),
          })
        ]))
      });

  });

  it('POST /api/comments -> add new comment object', () => {
    return request(app)
      .post('/api/comments')
      .send({
        // don't need replyToId or instant
        userId: Math.floor(Math.random() * 10000 + 1),
        text: "This is a test comment.",
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(200) // we don't send the object back in this example
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            insertId: expect.any(Number),
          })
        )
      })
  });

  it('POST /api/comments -> add bad new comment object', () => {
    return request(app)
      .post('/api/comments')
      .send({
        userId: 5
      })
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(500) // error
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "ER_BAD_NULL_ERROR: Column 'text' cannot be null",
          })
        )
      })
  });
})

describe('Upvotes API', () => {
  it('POST /api/upvotes -> add new upvote', () => {
    return request(app)
      .post('/api/upvotes')
      .send({
        // requires a post to exist already
        id: '2',
        userId: Math.floor(Math.random() * 10000 + 1),
      })
      .expect(200) // we don't send the object back in this example
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            insertId: expect.any(Number),
          })
        )
      })
  });

})