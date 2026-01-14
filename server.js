const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const nodemailer = require('nodemailer');

app.use(express.static('public'));
app.use(express.json());

let users = {};
let codes = {}; // { email: { code: '1234', expires: Date.now()+5*60*1000 } }

// Настройка SMTP (пример для Gmail; нужно включить "менее безопасные приложения")
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});

// Отправка кода
app.post('/send-code', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email пустой' });

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  codes[email] = { code, expires: Date.now() + 5 * 60 * 1000 }; // 5 минут

  transporter.sendMail({
    from: '"Link App" <your_email@gmail.com>',
    to: email,
    subject: 'Код подтверждения Link App',
    text: `Ваш код: ${code}`
  }, (err, info) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// Проверка кода
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = codes[email];
  if (record && record.code === code && record.expires > Date.now()) {
    delete codes[email];
    return res.json({ success: true });
  }
  return res.json({ success: false, error: 'Неверный код или истёк срок' });
});

// Socket.IO чат
io.on('connection', socket => {
  let myEmail = null;

  socket.on('login', email => {
    myEmail = email;
    const shortName = email.split('@')[0];
    users[socket.id] = shortName;
    io.emit('users', Object.values(users));
  });

  socket.on('chat message', data => io.emit('chat message', data));

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
  });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на http://0.0.0.0:${PORT}`));
