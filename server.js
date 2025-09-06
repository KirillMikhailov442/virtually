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
      console.log(`ROOM: ${roomId} USER: ${userId}`);
      
      socket.broadcast.to(roomId).emit('USER_CONNECTED', userId)
    })

    socket.on("TOGGLE_AUDIO", ({roomId, userId, stateAudio}) => {
      console.log('TOGGLE AUDIO');
      console.log(roomId, userId, stateAudio);
      
      socket.to(roomId).emit('TOGGLE_AUDIO', {userId, stateAudio})
    })

    socket.on("TOGGLE_VIDEO", ({roomId, userId, stateVideo}) => {
      console.log('TOGGLE VIDEO');
      console.log(roomId, userId, stateVideo);
      socket.to(roomId).emit('TOGGLE_VIDEO', {userId, stateVideo})
    })
});

server.listen(3000, () => {
  console.log('server running');
});
