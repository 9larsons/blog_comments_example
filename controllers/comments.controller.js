const Comment = require('../models/comment.model')

// add a new comment
exports.create = (request, result) => {

  // quick validation (server would reject it as it is nonnullable)
  if (!request.body) {
    result.status(400).send({
      message: "Comment is empty."
    });
  };

  const comment = new Comment({
    text: request.body.text,
    userId: request.body.userId,
    replyToId: request.body.replyToId
  });

  Comment.create(comment, (error, data) => {
    if (error) result.status(500).send({ message: error.message || "Error creating comment."});
    else result.send(data);
  });

}

// get all comments
exports.getAll = (request, result) => {

  Comment.getAll((error, data) => {
    if (error) result.status(500).send({ message: error.message || "Error getting comments."});
    else result.send(data);
  })

}