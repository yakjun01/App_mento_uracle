document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.intro-text');
    if (!el) return;

    // 문자별로 span으로 감싸기
    const text = el.textContent.trim();
    el.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const ch of text) {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        frag.appendChild(span);
    }
    el.appendChild(frag);

    // GSAP으로 애니메이션
    const chars = el.querySelectorAll('span');
    gsap.timeline()
        .to(chars, {
            duration: 0.6,
            y: '0%',
            opacity: 1,
            ease: 'power3.out',
            stagger: 0.03,
            from: { y: '30%' },
        })
        .to({}, { duration: 0.6 }) // 잠시 대기
        .call(() => {
            // 애니메이션 끝나면 index.html로 이동
            window.location.href = 'index.html';
        });
});
