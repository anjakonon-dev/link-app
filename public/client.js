const socket = io();

const loginUI = document.getElementById('loginUI');
const mainUI = document.getElementById('mainUI');
const codeUI = document.getElementById('codeUI');

const emailInput = document.getElementById('email');
const getCodeBtn = document.getElementById('getCodeBtn');
const codeInput = document.getElementById('code');
const verifyBtn = document.getElementById('verifyBtn');

let myEmail = null;

// 1. Получить код
getCodeBtn.onclick = async () => {
  const email = emailInput.value.trim();
  if (!email) return alert('Введите email');

  const res = await fetch('/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data.success) {
    codeUI.style.display = '';
    alert('Код отправлен на email');
  } else {
    alert(data.error);
  }
};

// 2. Проверить код
verifyBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const code = codeInput.value.trim();
  if (!code) return alert('Введите код');

  const res = await fetch('/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  const data = await res.json();
  if (data.success) {
    myEmail = email;
    loginUI.style.display = 'none';
    mainUI.style.display = '';
    socket.emit('login', myEmail);
  } else {
    alert(data.error);
  }
};

// 3. Чат
const usersDiv = document.getElementById('users');
const chatDiv = document.getElementById('chat');
const msgInput = document.getElementById('message');
const sendBtn = document.getElementById('send');

sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('chat message', { from: myEmail, text });
  msgInput.value = '';
};

msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendBtn.onclick();
});

socket.on('chat message', data => {
  const div = document.createElement('div');
  div.textContent = `${data.from}: ${data.text}`;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
});

socket.on('users', userList => {
  usersDiv.innerHTML = '';
  userList.forEach(u => {
    const btn = document.createElement('button');
    btn.textContent = u;
    usersDiv.appendChild(btn);
  });
});
