const swiper = document.getElementById('card-swiper');
const cards = swiper.querySelectorAll('.card');
let index = 0;
let startY = 0;
let deltaY = 0;
const threshold = 50;

function updateCards() {
  const total = cards.length;
  const prev = (index - 1 + total) % total;
  const next = (index + 1) % total;
  const prev2 = (index - 2 + total) % total;
  const next2 = (index + 2) % total;
  cards.forEach((c, i) => {
    c.classList.remove('active', 'prev', 'next', 'prev2', 'next2');
    if (i === index) c.classList.add('active');
    else if (i === prev) c.classList.add('prev');
    else if (i === next) c.classList.add('next');
    else if (i === prev2) c.classList.add('prev2');
    else if (i === next2) c.classList.add('next2');
  });
}

swiper.addEventListener('touchstart', (e) => (startY = e.touches[0].clientY));
swiper.addEventListener('touchmove', (e) => (deltaY = e.touches[0].clientY - startY));
swiper.addEventListener('touchend', () => {
  if (Math.abs(deltaY) > threshold) {
    index = deltaY < 0 ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
    updateCards();
  }
  startY = 0;
});

swiper.addEventListener('mousedown', (e) => (startY = e.clientY));
swiper.addEventListener('mouseup', (e) => {
  deltaY = e.clientY - startY;
  if (Math.abs(deltaY) > threshold) {
    index = deltaY < 0 ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
    updateCards();
  }
});

updateCards();