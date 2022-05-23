module.exports = app => {

  const comments = require('../controllers/comments.controller.js');
  const upvotes = require('../controllers/upvotes.controller.js');

  const router = require("express").Router();

  // new comment
  router.post('comments', comments.create);

  // get all comments
  router.get('comments', comments.getAll);

  // add upvote
  router.post('upvotes', upvotes.create);

  // delete upvote
  router.delete('upvotes', upvotes.delete);

  app.use('/api/', router)

};