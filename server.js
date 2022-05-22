// prepare express
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
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

// ... connect
connection.connect(error => {
  if (error) throw error
  console.log("Connected to the database.")
}) 

// add a new comment
app.post("/api/addComment", (request, response) => {
  const newCommentValues = [
    request.body.comment, // comment text
    request.body.userId, // user ID
    request.body.replyToId // only populated if a reply
  ]
  connection.query(
    // let database create timestamp for now...
    `insert into comments (text,userId,instant,replyToId) values (?,?,now(),?);`,
    newCommentValues,
    function (error, data) {
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
    function (error, data) {
      if (error) console.log(error)
      response.send(data)
    }
  )
})

// add upvote
app.post('/api/upvote', (request, response) => {
  const upvote = [
    request.body.id, // commentId
    request.body.userId // user Id
  ]
  connection.query(
    // let database create timestamp for now...
    `insert into upvotes (commentId,userId,instant) values (?,?,now());`,
    upvote,
    function (error, data) {
      if (error) console.log(error)
      response.status(201).json({
        status: "success",
        message: "upvote added",
      })
    }
  )
})

app.delete('/api/upvotes', (request, response) => {
  const upvote = [
    request.body.id, // commentId
    request.body.userId, // user ID
  ]
  connection.query(
    // let database create timestamp for now...
    `delete from upvotes where commentId = ? and userId = ?;`,
    upvote,
    function (error, data) {
      if (error) console.log(error)
      response.status(201).json({
        status: "success",
        message: "upvote deleted",
      })
    }
  )
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'))
})

io.on('connection', (socket) => {
  console.log(`... user connected`)
  socket.on('disconnect', () => {
    console.log(`.... user disconnected`)
  })
  socket.on('upvote deleted', (id) => {
    socket.broadcast.emit('upvote deleted', id)
  })
  socket.on('upvote added', (id) => {
    socket.broadcast.emit('upvote added', id)
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})