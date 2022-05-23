// prepare express
const express = require('express')
const app = express()
require('./routes/routes.js')(app)
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

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})