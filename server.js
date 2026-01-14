const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = {};

io.on('connection', socket => {
  let userEmail = null;

  socket.on('login', email => {
    userEmail = email;
    const shortName = email.split('@')[0];
    users[socket.id] = shortName;
    io.emit('users', Object.values(users));
  });

  socket.on('chat message', data => {
    io.emit('chat message', data);
  });

  socket.on('call user', data => {
    io.to(data.to).emit('incoming call', { from: data.from });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
http.listen(PORT, HOST, () => console.log(`Сервер запущен на http://${HOST}:${PORT}`));
http.listen(PORT, () => console.log(`Сервер запущен на ${PORT}`));
