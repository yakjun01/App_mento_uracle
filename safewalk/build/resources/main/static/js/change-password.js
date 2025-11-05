document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('change-password-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const errorMessage = document.getElementById('password-error');

  if (!form || !newPasswordInput || !confirmPasswordInput || !errorMessage) {
    console.error('필수 DOM 요소를 찾을 수 없습니다.');
    return;
  }

  function validatePassword() {
    if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }
  }

  newPasswordInput.addEventListener('keyup', validatePassword);
  confirmPasswordInput.addEventListener('keyup', validatePassword);

  form.addEventListener('submit', function (event) {
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      errorMessage.style.display = 'block';
      event.preventDefault();
    }
  });
});
