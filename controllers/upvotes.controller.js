
const Upvote = require('../models/upvote.model')

// add a new upvote
exports.create = (request, result) => {

  // quick validation (server would reject it as it is nonnullable)
  if (!request.body) {
    result.status(400).send({
      message: "Invalid upvote."
    });
  };

  const upvote = new Upvote({
    commentId: request.body.id,
    userId: request.body.userId,
  });

  Upvote.create(upvote, (error, data) => {
    if (error) result.status(500).send({ message: error.message || "Error creating upvote." });
    else result.send(data);
  });

}

exports.delete = (id, result) => {

  // quick validation (server would reject it as it is nonnullable)
  if (id === null) {
    result.status(400).send({
      message: "Invalid upvote."
    });
  };

  Upvote.delete(id, (error, data) => {
    if (error) result.status(500).send({ message: error.message || "Error deleting upvote." });
    else result.send(data);
  });

}