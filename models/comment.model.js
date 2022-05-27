const sql = require('./db.js');

// constructor
function Comment(comment) {
  this.text = comment.text;
  this.userId = comment.userId;
  this.replyToId = comment.replyToId || null;
}

Comment.create = (newComment, result) => {
  console.log(`trying to add new comment... `,newComment)
  sql.query(
    // alternatively could use the object values and [insert into comment SET ?] but we would
      // lose the server setting the time in that way
    `insert into comments (text,userId,instant,replyToId) values (?,?,UTC_TIMESTAMP(),?);`,
    Object.values(newComment), // sql wants an array, but we want the constructor to be an object
    (error, res) => {
      if (error) {
        console.log(`error creating comment`, error);
        result(error, null)
        return;
      }
      result(null, res)
    }
  )
}

Comment.getAll = result => {
  sql.query(
    `select comments.*,coalesce(upvotes.count,0) upvotes
    from comments
      left join (
        select commentId,count(*) count
            from upvotes
            group by commentId
      ) upvotes
        on upvotes.commentId = comments.id
    order by comments.instant;`,
    (error, res) => {
      if (error) {
        console.log(`error creating comment`, error);
        result(error, null)
        return;
      }
      console.log(`fetched comments ${new Date}`)
      result(null, res)
    }
  )
}

module.exports = Comment;