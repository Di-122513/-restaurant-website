/**
 * 味觉小馆 — 餐饮网站脚本
 * 菜单筛选、导航、预约、滚动动画
 */
document.addEventListener('DOMContentLoaded', () => {

    const header    = document.getElementById('header');
    const nav       = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const backToTop = document.getElementById('backToTop');
    const navLinks  = document.querySelectorAll('.nav-link');
    const sections  = document.querySelectorAll('section[id]');
    const bookingForm = document.getElementById('bookingForm');

    // ========== 滚动效果 ==========
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 50);
        backToTop.classList.toggle('visible', y > 500);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => highlightNav(y), 100);
    });

    function highlightNav(y) {
        let current = '';
        sections.forEach(s => {
            if (y >= s.offsetTop - 100) current = s.getAttribute('id');
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
        });
    }

    // ========== 汉堡菜单 ==========
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
    navLinks.forEach(l => l.addEventListener('click', () => nav.classList.remove('open')));
    document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) nav.classList.remove('open');
    });

    // ========== 回到顶部 ==========
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ========== 菜单分类筛选 ==========
    const tabs = document.querySelectorAll('.menu-tab');
    const cards = document.querySelectorAll('.menu-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.cat;
            cards.forEach(card => {
                card.classList.toggle('hidden', cat !== 'all' && card.dataset.cat !== cat);
            });
        });
    });

    // ========== 预约表单 ==========
    // 设置日期最小值为今天
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    bookingForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name  = bookingForm.querySelector('input[type="text"]').value.trim();
        const phone = bookingForm.querySelector('input[type="tel"]').value.trim();
        if (!name || !phone) {
            showToast('请至少填写姓名和手机号码', 'error');
            return;
        }
        const btn = bookingForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = '提交中...';
        btn.disabled = true;
        try {
            const response = await fetch(bookingForm.action, {
                method: 'POST',
                body: new FormData(bookingForm),
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                showToast('预约成功！我们会尽快电话确认。', 'success');
                bookingForm.reset();
            } else {
                showToast('提交失败，请稍后重试或直接拨打电话。', 'error');
            }
        } catch (err) {
            showToast('网络异常，请稍后重试或直接拨打电话。', 'error');
        }
        btn.textContent = original;
        btn.disabled = false;
    });

    // ========== Toast ==========
    function showToast(msg, type = 'success') {
        const old = document.querySelector('.toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
    }

    // ========== 滚动渐入动画 ==========
    const animEls = document.querySelectorAll('.menu-card, .review-card, .feature-item, .gallery-item, .a-stat');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

});
