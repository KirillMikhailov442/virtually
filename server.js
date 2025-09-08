const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
    io.emit("NUMBER_OF_CONNECTIONS", Array.from(io.sockets.adapter.rooms).length)

    socket.on("NUMBER_OF_CONNECTIONS", ()=> {
      io.emit("NUMBER_OF_CONNECTIONS", Array.from(io.sockets.adapter.rooms).length)
    })

    socket.on("disconnect", () =>{
      io.emit("NUMBER_OF_CONNECTIONS", Array.from(io.sockets.adapter.rooms).length)
    })

    socket.on('JOIN', ({roomId, userId}) =>{  
      socket.join(roomId)
      socket.broadcast.to(roomId).emit('USER_CONNECTED', userId)
    })

    socket.on("TOGGLE_AUDIO", ({roomId, userId, stateAudio}) => {
      socket.to(roomId).emit('TOGGLE_AUDIO', {userId, stateAudio})
    })

    socket.on("LEAVE", ({roomId, userId}) => {      
      socket.to(roomId).emit('USER_LEFT', userId)
    })

    socket.on("TOGGLE_VIDEO", ({roomId, userId, stateVideo}) => {
      socket.to(roomId).emit('TOGGLE_VIDEO', {userId, stateVideo})
    })

    socket.on('SAY_MY_NAME', ({roomId, userId, name}) => {
      socket.broadcast.to(roomId).emit('SAY_YOUR_NAME', {userId, name})
    })

    socket.on('SAY_MY_NAME_ANSWER', ({roomId, userId, name}) => {
      socket.broadcast.to(roomId).emit('SAY_YOUR_NAME_ANSWER', {userId, name})
    })
});

const PORT = 3000
server.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
