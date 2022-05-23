const sql = require('./db');

// constructor
const Upvote = function (upvote) {
  this.commentId = upvote.commentId;
  this.userId = upvote.userId;
}

Upvote.create = (newUpvote, result) => {
  sql.query(
    `insert into upvotes (commentId,userId,instant) values (?,?,now());`,
    // convert to array to make sql happy; would be able to use object with SET command
    //  but would lose the sql server setting the time
    Object.values(newUpvote),
    (error, res) => {
      if (error) {
        console.log(`error creating upvote`, error);
        result(error, null)
        return;
      }
      result(null, res)
    }
  )
}

Upvote.delete = (id, result) => {
  sql.query(
    `delete from upvotes where commentId = ? and userId = ?;`,
    id,
    (error, res) => {
      if (error) {
        console.log(`error deleting comment`, error);
        result(error, null)
        return;
      }
      result(null, res)
    }
  )
}

module.exports = Upvote;