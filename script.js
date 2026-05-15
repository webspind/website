const greeting = document.getElementById('greeting');
const toggleBtn = document.getElementById('toggle-btn');

const messages = [
  'Hello, World!',
  'Hello again!',
  'Still here. 👋',
];

let index = 0;

toggleBtn.addEventListener('click', () => {
  index = (index + 1) % messages.length;
  greeting.textContent = messages[index];
});
