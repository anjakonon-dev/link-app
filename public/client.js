const socket = io();

const registerUI = document.getElementById('registerUI');
const mainUI = document.getElementById('mainUI');

const emailInput = document.getElementById('email');
const nicknameInput = document.getElementById('nickname');
const confirmBtn = document.getElementById('confirmBtn');
const nickError = document.getElementById('nickError');

const usersDiv = document.getElementById('users');
const chatDiv = document.getElementById('chat');
const msgInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const toggleThemeBtn = document.getElementById('toggleTheme');
const searchInput = document.getElementById('searchUser');

let myEmail = null;
let myNick = null;
let onlineUsers = [];

// Регистрация
confirmBtn.onclick = () => {
  const email = emailInput.value.trim();
  const nick = nicknameInput.value.trim();
  if (!email || !nick) return alert('Введите email и никнейм!');

  myEmail = email;
  myNick = nick;

  socket.emit('login', { email: myEmail, nick: myNick });
};

// Никнейм занят
socket.on('nickTaken', () => {
  nickError.style.display = 'block';
});

// Пользователи онлайн
socket.on('users', users => {
  onlineUsers = users;
  renderUsers();
  registerUI.style.display = 'none';
  mainUI.style.display = '';
});

function renderUsers() {
  const search = searchInput.value.trim().toLowerCase();
  usersDiv.innerHTML = '';
  onlineUsers
    .filter(u => u.nick.toLowerCase().includes(search))
    .forEach(u => {
      const btn = document.createElement('button');
      btn.textContent = u.nick;
      btn.onclick = () => alert(`Выбран: ${u.nick}`);
      usersDiv.appendChild(btn);
    });
}

searchInput.oninput = renderUsers;

// Чат
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('chat message', { from: myNick, text });
  msgInput.value = '';
};

socket.on('chat message', data => {
  const div = document.createElement('div');
  div.textContent = `${data.from}: ${data.text}`;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight; // автопрокрутка вниз
});

// Тема
toggleThemeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? 'Светлая тема' : 'Тёмная тема';
};
