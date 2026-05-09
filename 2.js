const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouch = 'ontouchstart' in window;

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span style="color:#666">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

if (!isMobile) {
    const workTitles = document.querySelectorAll('.work-title');
    workTitles.forEach(title => {
        const fx = new TextScramble(title);
        const originalText = title.textContent;
        
        title.closest('.work-item').addEventListener('mouseenter', () => {
            fx.setText(originalText);
        });
    });
}

const sections = document.querySelectorAll('.grid-section, .department-section');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'sectionFadeIn 1s cubic-bezier(0.23, 1, 0.320, 1) forwards';
        }
    });
}, { threshold: 0.2 });

sections.forEach(section => {
    section.style.opacity = '0';
    sectionObserver.observe(section);
});

const sectionStyle = document.createElement('style');
sectionStyle.textContent = `
    @keyframes sectionFadeIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 0.8;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sectionStyle);

function createRipple(e) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(10, 10, 10, 0.3), transparent);
        pointer-events: none;
        animation: ripple 0.8s ease-out;
    `;
    
    const rect = e.currentTarget.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left - 25) + 'px';
    ripple.style.top = (e.clientY - rect.top - 25) + 'px';
    
    e.currentTarget.style.position = 'relative';
    e.currentTarget.style.overflow = 'hidden';
    e.currentTarget.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
}

document.querySelectorAll('.work-item, .department-card, .hero-cta').forEach(el => {
    el.addEventListener('click', createRipple);
});

const filterBtns = document.querySelectorAll('.filter-btn');
const workItems = document.querySelectorAll('.work-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        workItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

const deptFilterBtns = document.querySelectorAll('.dept-filter-btn');
const deptCards = document.querySelectorAll('.department-card');

deptFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.dept;
        
        deptFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        deptCards.forEach(card => {
            if (filter === 'all') {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            } else if (card.dataset.dept === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

if (!isMobile) {
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateAdvancedParallax();
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateAdvancedParallax() {
        const scrollY = window.scrollY;
        
        document.body.style.backgroundPosition = `0 ${scrollY * 0.5}px`;
        
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroRect = hero.getBoundingClientRect();
            if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
                hero.style.transform = `translateY(${scrollY * 0.3}px)`;
                hero.style.opacity = Math.max(0.3, 1 - (scrollY / 800));
            }
        }
        
        const workImages = document.querySelectorAll('.work-image');
        workImages.forEach((image, index) => {
            const rect = image.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const speed = 0.08 + (index * 0.01);
                const yPos = -(rect.top * speed);
                image.style.transform = `translateY(${yPos}px)`;
            }
        });
        
        const gridSection = document.querySelector('.grid-section');
        if (gridSection) {
            const rect = gridSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = scrollY * 0.05;
                gridSection.style.transform = `translateY(${yPos}px)`;
            }
        }
    }
}

if (!isMobile) {
    const magneticElements = document.querySelectorAll('.hero-cta, .work-item, nav a');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / (this.classList.contains('hero-cta') ? 3 : 8);
            const deltaY = (y - centerY) / (this.classList.contains('hero-cta') ? 3 : 8);
            
            this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });
}

function splitTextAdvanced(element) {
    const text = element.textContent;
    element.innerHTML = '';
    element.style.overflow = 'visible';
    
    const words = text.split(' ');
    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.marginRight = '0.3em';
        wordSpan.style.overflow = 'hidden';
        
        word.split('').forEach((char, charIndex) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(100%) rotate(10deg)';
            span.style.animation = `charFadeIn 0.8s cubic-bezier(0.23, 1, 0.320, 1) ${(wordIndex * 0.05) + (charIndex * 0.02)}s forwards`;
            wordSpan.appendChild(span);
        });
        
        element.appendChild(wordSpan);
    });
}

const advancedStyle = document.createElement('style');
advancedStyle.textContent = `
    @keyframes charFadeIn {
        to {
            opacity: 1;
            transform: translateY(0) rotate(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(40px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(advancedStyle);

setTimeout(() => {
    const heroTitle = document.querySelector('h1');
    if (heroTitle) {
        splitTextAdvanced(heroTitle);
    }
    
    const sectionTitles = document.querySelectorAll('.section-title');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                splitTextAdvanced(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    sectionTitles.forEach(title => titleObserver.observe(title));
}, 600);

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            
            if (entry.target.classList.contains('work-item')) {
                const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                entry.target.style.animation = `slideUp 0.8s cubic-bezier(0.23, 1, 0.320, 1) ${delay * 0.1}s forwards`;
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.work-item, .department-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

if (!isMobile) {
    const workItems = document.querySelectorAll('.work-item');
    
    workItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
            
            const image = item.querySelector('.work-image');
            if (image) {
                image.style.transform = `translate(${(centerX - x) / 30}px, ${(centerY - y) / 30}px)`;
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            const image = item.querySelector('.work-image');
            if (image) {
                image.style.transform = 'translate(0, 0)';
            }
        });
    });
}

const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--black) 0%, var(--gray-mid) 50%, var(--black) 100%);
    background-size: 200% 100%;
    z-index: 10000;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s ease;
    animation: shimmer 3s ease-in-out infinite;
`;
document.body.appendChild(progressBar);

const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
    @keyframes shimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
`;
document.head.appendChild(shimmerStyle);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight);
    progressBar.style.transform = `scaleX(${scrolled})`;
    progressBar.style.width = '100%';
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});

if (isMobile || isTouch) {
    document.querySelectorAll('.work-item, .department-card, .hero-cta').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        el.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

console.log('%c SOL', 'font-family: DM Serif Display, serif; font-size: 24px; color: #fafafa; background: #0a0a0a; padding: 15px 25px; font-weight: 400; border-radius: 4px;');

const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(250, 250, 250, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        header.style.padding = '24px 0';
    } else {
        header.style.background = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.boxShadow = 'none';
        header.style.padding = '40px 0';
    }
    
    if (currentScroll > lastScroll && currentScroll > 300) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        
        logo.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        logo.style.transform = 'rotate(360deg) scale(1.2)';
        
        setTimeout(() => {
            logo.style.transform = 'rotate(0deg) scale(1)';
        }, 800);
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    logo.style.cursor = 'pointer';
}