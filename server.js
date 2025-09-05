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
});

server.listen(3000, () => {
  console.log('server running');
});
