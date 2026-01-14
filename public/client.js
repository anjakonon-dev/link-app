const socket = io();

const emailInput = document.getElementById('email');
const loginBtn = document.getElementById('loginBtn');
const mainUI = document.getElementById('mainUI');

let myEmail = null;

loginBtn.onclick = () => {
  const email = emailInput.value.trim();
  if (!email) return;
  myEmail = email;
  socket.emit('login', email);
  mainUI.style.display = '';
};

const usersDiv = document.getElementById('users');
const chatDiv = document.getElementById('chat');

socket.on('users', userList => {
  usersDiv.innerHTML = '';
  userList.forEach(u => {
    const btn = document.createElement('button');
    btn.textContent = u;
    btn.onclick = () => alert(`Выбран: ${u}`);
    usersDiv.appendChild(btn);
  });
});

const msgInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('chat message', { from: myEmail, text });
  msgInput.value = '';
};

socket.on('chat message', data => {
  const div = document.createElement('div');
  div.textContent = `${data.from}: ${data.text}`;
  chatDiv.appendChild(div);
});

document.getElementById('toggleTheme').onclick = () => {
  document.body.classList.toggle('dark');
};
