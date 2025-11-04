document.addEventListener('DOMContentLoaded', function () {
  // 비밀번호 일치 여부 확인
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('password-confirm');
  const passwordErrorMessage = document.getElementById('password-error');
  const form = document.querySelector('form');

  function validatePassword() {
    if (passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value) {
      passwordErrorMessage.style.display = 'block';
    } else {
      passwordErrorMessage.style.display = 'none';
    }
  }

  if (passwordInput && passwordConfirmInput) {
    passwordInput.addEventListener('keyup', validatePassword);
    passwordConfirmInput.addEventListener('keyup', validatePassword);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      if (passwordInput.value !== passwordConfirmInput.value) {
        passwordErrorMessage.style.display = 'block';
        event.preventDefault();
      }
    });
  }

  // 아이디(이메일) 중복 체크
  const checkEmailButton = document.getElementById('check-email-button');
  const emailInput = document.getElementById('email');
  const emailCheckMsg = document.getElementById('email-check-msg');

  if (checkEmailButton && emailInput && emailCheckMsg) {
    checkEmailButton.addEventListener('click', function () {
      const email = emailInput.value;
      if (!email) {
        emailCheckMsg.textContent = '이메일을 입력해주세요.';
        emailCheckMsg.style.color = 'red';
        emailCheckMsg.style.display = 'block';
        return;
      }

      fetch('/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'email=' + encodeURIComponent(email),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            emailCheckMsg.textContent = '이미 존재하는 아이디 입니다.';
            emailCheckMsg.style.color = 'red';
          } else {
            emailCheckMsg.textContent = '사용 가능한 이메일입니다.';
            emailCheckMsg.style.color = 'blue';
          }
          emailCheckMsg.style.display = 'block';
        })
        .catch((error) => {
          console.error('Error:', error);
          emailCheckMsg.textContent = '오류가 발생했습니다. 다시 시도해주세요.';
          emailCheckMsg.style.color = 'red';
          emailCheckMsg.style.display = 'block';
        });
    });
  }
});
