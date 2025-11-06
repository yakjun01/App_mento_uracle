document.addEventListener('DOMContentLoaded', function () {
  const swiper = document.getElementById('card-swiper');

  if (!swiper) return;

  const cards = swiper.querySelectorAll('.card');
  let currentIndex = 0;
  let startY = 0;
  let deltaY = 0;
  let isDragging = false;
  const swipeThreshold = 50;

  // 카드 상태 업데이트 함수 (루프 적용)
  function updateCards() {
    const totalCards = cards.length;
    if (totalCards === 0) return;

    const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
    const prev2Index = (currentIndex - 2 + totalCards) % totalCards;
    const nextIndex = (currentIndex + 1) % totalCards;
    const next2Index = (currentIndex + 2) % totalCards;

    cards.forEach((card, index) => {
      card.classList.remove('active', 'prev', 'prev2', 'next', 'next2', 'expanded');
      if (index === currentIndex) {
        card.classList.add('active');
      } else if (index === prevIndex) {
        card.classList.add('prev');
      } else if (index === prev2Index) {
        card.classList.add('prev2');
      } else if (index === nextIndex) {
        card.classList.add('next');
      } else if (index === next2Index) {
        card.classList.add('next2');
      }
    });
  }

  swiper.addEventListener('click', function (event) {
    const clickedCard = event.target.closest('.card.active'); // active 카드만
    if (clickedCard) {
      clickedCard.classList.toggle('expanded');

      cards.forEach((card) => {
        if (card !== clickedCard) {
          card.style.opacity = clickedCard.classList.contains('expanded') ? '0.1' : '';
        }
      });
      swiper.style.pointerEvents = clickedCard.classList.contains('expanded') ? 'none' : '';
      clickedCard.style.pointerEvents = 'auto';
    }
  });

  swiper.addEventListener('mousedown', (e) => {
    if (!document.querySelector('.card.expanded')) {
      isDragging = true;
      startY = e.clientY;
      deltaY = 0;
      swiper.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  swiper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    deltaY = e.clientY - startY;
  });

  swiper.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    swiper.style.cursor = 'grab';
    if (Math.abs(deltaY) > swipeThreshold) {
      const totalCards = cards.length;
      if (deltaY < 0) {
        // 위로 드래그 (다음)
        currentIndex = (currentIndex + 1) % totalCards;
      } else if (deltaY > 0) {
        // 아래로 드래그 (이전)
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      }
      updateCards();
    }
    startY = 0;
  });

  swiper.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false;
      swiper.style.cursor = 'grab';
      startY = 0;
    }
  });

  swiper.addEventListener(
    'touchstart',
    (e) => {
      if (!document.querySelector('.card.expanded')) {
        startY = e.touches[0].clientY;
        deltaY = 0;
      }
    },
    { passive: true }
  ); // 스크롤 성능 향상을 위해 passive 옵션 고려

  swiper.addEventListener(
    'touchmove',
    (e) => {
      if (!startY) return;
      deltaY = e.touches[0].clientY - startY;
    },
    { passive: true }
  );

  swiper.addEventListener('touchend', () => {
    if (Math.abs(deltaY) > swipeThreshold) {
      const totalCards = cards.length;
      if (deltaY < 0) {
        // 위로 스와이프 (다음)
        currentIndex = (currentIndex + 1) % totalCards;
      } else if (deltaY > 0) {
        // 아래로 스와이프 (이전)
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      }
      updateCards();
    }
    startY = 0;
  });

  // 초기 카드 상태 설정
  updateCards();
  swiper.style.cursor = 'grab';
});
