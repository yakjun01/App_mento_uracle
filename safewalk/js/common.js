document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 모달(팝업) 제어 로직 ---
    // data-modal-target="모달ID" 속성을 가진 버튼을 찾습니다.
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

    // 모달의 '취소' 버튼이나 '뒷배경'을 클릭시 닫기
    // .modal-close 클래스를 가진 버튼 (취소, 아니오 등)
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach((closeBtn) => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal-overlay').classList.remove('active');
        });
    });

    // 뒷배경 클릭 시 닫기
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
            // 모달 창 내부가 아닌, 정확히 뒷배경(overlay)을 클릭했을 때만
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // --- 2. 토글 버튼 그룹 (회원가입 혈액형 등) ---
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
