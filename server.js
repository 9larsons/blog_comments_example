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