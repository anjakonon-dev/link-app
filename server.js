const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = {}; // { socket.id: { email, nick } }

io.on('connection', socket => {
  socket.on('login', data => {
    // Проверка уникальности никнейма
    const nickExists = Object.values(users).some(u => u.nick === data.nick);
    if (nickExists) {
      socket.emit('nickTaken');
      return;
    }

    users[socket.id] = { email: data.email, nick: data.nick };
    io.emit('users', Object.values(users));
  });

  socket.on('chat message', data => io.emit('chat message', data));

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
http.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}`));
