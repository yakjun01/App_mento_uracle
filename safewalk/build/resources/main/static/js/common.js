document.addEventListener('DOMContentLoaded', () => {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault(); // a태그나 button 기본 동작 방지
      const modalId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
      }
    });
  });

  // '취소', '뒷배경 클릭시 닫기
  const modalCloses = document.querySelectorAll('.modal-close');
  modalCloses.forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal-overlay').classList.remove('active');
    });
  });

  const modalOverlays = document.querySelectorAll('.modal-overlay');
  modalOverlays.forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  const toggleButtons = document.querySelectorAll('.toggle-group .toggle-button');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // 같은 그룹 내의 다른 버튼들 비활성화
      const group = button.closest('.toggle-group');
      if (group) {
        group.querySelectorAll('.toggle-button').forEach((btn) => {
          btn.classList.remove('active');
        });
      }
      // 클릭된 버튼만 활성화
      button.classList.add('active');
    });
  });
});
