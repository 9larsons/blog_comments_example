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
const connection = require('./models/db')

// ... connect
connection.connect(error => {
  if (error) throw error
  console.log("Connected to the database.")
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


const comments = require('./controllers/comments.controller');
const upvotes = require('./controllers/upvotes.controller');

const router = require("express").Router();

// new comment
router.post('/api/comments', comments.create);

// get all comments
router.get('/api/comments', comments.getAll);

// add upvote
router.post('/api/upvotes', upvotes.create);

// delete upvote
router.delete('/api/upvotes', upvotes.delete);


app.use('', router)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})