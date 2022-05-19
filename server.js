// prepare express
const express = require('express')
const app = express()
const path = require('path')
const port = 8080

app.use(express.static('public')) // make everything in /public accessible
app.use(express.json()) // don't need to install body-parser any more for JSON parsing

// prepare mysql database
const mysql = require('mysql')
const res = require('express/lib/response')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'comments_schema'
})

// add a new comment
app.post("/api/addComment", (request, response) => {
  const newCommentValues = [
    request.body.comment, // comment text
    Math.floor(Math.random()*10000+1), // user ID
  ]
  connection.query(
    // let database create timestamp for now...
    `insert into comments (text,userId,instant) values (?,?,now());`,
    newCommentValues,
    function (error, data, fields) {
      if (error) console.log(error)
      response.status(201).json({
        status: "success",
        message: "comment created",
      })
    }
  )
})

// get all comments (sorted by date posted, oldest > newest)
app.get('/api/getComments', (request, response) => {
  connection.query(
    `select comments.*,coalesce(upvotes.count,0) upvotes
    from comments
      left join (
        select commentId,count(*) count
            from upvotes
            group by commentId
      ) upvotes
        on upvotes.commentId = comments.id
    order by comments.instant;`,
    function (error, data, fields) {
      if (error) console.log(error)
      response.send(data)
      console.log("Loaded Comments")
    }
  )
})

connection.connect(error => {
  if (error) throw error
  console.log("Connected to the database.")
}) 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})