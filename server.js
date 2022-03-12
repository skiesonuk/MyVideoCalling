var path = require("path");
const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const { v4: uuidV4 } = require('uuid')


app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/home', (req, res) => {
  res.render('index')
})

app.get('/vc_start', (req, res) => {
  res.redirect(`/vc_start/${uuidV4()}`)
})

app.get('/leave', (req, res) => {
  res.send('You have Leaved meeeting and this is home page')
})

app.get('/vc_start/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);

    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

var port = process.env.PORT || 4001
server.listen(port, () => {
  console.log('Server is listening on port : ' + port)
})