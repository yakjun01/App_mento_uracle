document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('signup-main-content');
    const header = document.querySelector('.app-header');
    const backButton = header.querySelector('.back-button');
    const stepIndicator = header.querySelector('.header-step');
    
    let currentStep = 1;
    let isEmailAvailable = false;

    const updateHeader = (step) => {
        stepIndicator.textContent = `${step} / 3`;
        // Always show the back button as per user request
        backButton.style.visibility = 'visible';
    };

    const loadStep = async (step) => {
        try {
            const response = await fetch(`/signup-step${step}`);
            if (!response.ok) {
                throw new Error(`Failed to load step content. Status: ${response.status}`);
            }
            
            const html = await response.text();
            mainContainer.innerHTML = html;
            currentStep = step;
            updateHeader(step);
            attachFormSubmitListener(step);

            if (step === 1) {
                attachStep1Listeners();
            }

        } catch (error) {
            console.error('Error loading step:', error);
            mainContainer.innerHTML = `<p>오류가 발생했습니다. <a href="/signup">다시 시도</a></p>`;
        }
    };

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep === 1) {
            if (confirm('회원가입을 중단하고 메인 페이지로 이동하시겠습니까?')) {
                window.location.href = '/';
            }
        } else {
            loadStep(currentStep - 1);
        }
    });

    const attachStep1Listeners = () => {
        const emailInput = document.getElementById('email');
        const checkEmailButton = document.getElementById('check-email-button');
        const emailCheckMsg = document.getElementById('email-check-msg');
        const passwordInput = document.getElementById('password');
        const passwordConfirmInput = document.getElementById('password-confirm');
        const passwordErrorMessage = document.getElementById('password-error');

        if (!emailInput || !checkEmailButton || !passwordConfirmInput) return;

        emailInput.addEventListener('input', () => {
            isEmailAvailable = false;
            emailCheckMsg.style.display = 'none';
        });

        checkEmailButton.addEventListener('click', () => {
            fetch('/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'email=' + encodeURIComponent(emailInput.value)
            })
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    emailCheckMsg.textContent = '이미 존재하는 아이디 입니다.';
                    emailCheckMsg.style.color = 'red';
                    isEmailAvailable = false;
                } else {
                    emailCheckMsg.textContent = '사용 가능한 이메일입니다.';
                    emailCheckMsg.style.color = 'blue';
                    isEmailAvailable = true;
                }
                emailCheckMsg.style.display = 'block';
            });
        });

        passwordConfirmInput.addEventListener('keyup', () => {
            if (passwordInput.value !== passwordConfirmInput.value) {
                passwordErrorMessage.style.display = 'block';
            } else {
                passwordErrorMessage.style.display = 'none';
            }
        });
    };

    const attachFormSubmitListener = (step) => {
        const form = mainContainer.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (step === 1) {
                if (document.getElementById('password').value !== document.getElementById('password-confirm').value) {
                    document.getElementById('password-error').style.display = 'block';
                    return;
                }
                if (!isEmailAvailable) {
                    alert('이메일 중복 확인을 해주세요.');
                    return;
                }
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`/signup-step${step}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} ${errorText}`);
                }

                const result = await response.json();

                if (result.success) {
                    if (step === 3) {
                        document.getElementById('complete-modal').classList.add('active');
                    } else {
                        loadStep(step + 1);
                    }
                } else {
                    alert(result.message || '알 수 없는 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Submit error:', error);
                alert('양식 제출 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
            }
        });
    };

    // Initial load
    loadStep(1);
});