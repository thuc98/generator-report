const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const {registMessageFromUDP} = require("./udp_server");
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => { 
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
 });

 registMessageFromUDP((message) => {
     if (message.startsWith("**LOG**")) {
        io.sockets.emit('log', message.substring(7));
     } else { 
        io.sockets.emit('log-request', message.substring(11));
     } 
 })

 server.listen(3000, () => {
    console.log('listening on *:3000');
  });