console.log("IT'S ALIVE! 🚀");

// ==========================================
// LANDING PAGE ENHANCED INTERACTIONS
// ==========================================

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// ==========================================
// ANIMATED PARTICLES BACKGROUND
// ==========================================
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// ==========================================
// DARK MODE TOGGLE (ENHANCED)
// ==========================================
function setupThemeSwitcher() {
    const themeSwitcher = `
        <label class="color-scheme">
            <span class="sr-only">Select color theme:</span>
            <select id="theme-switcher" aria-label="Select color theme">
                <option value="light dark">🌓 Auto</option>
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
            </select>
        </label>
    `;
    
    document.body.insertAdjacentHTML("afterbegin", themeSwitcher);

    const select = document.getElementById("theme-switcher");
    
    // Apply saved preference or default to auto
    const savedScheme = localStorage.getItem("colorScheme") || "light dark";
    setColorScheme(savedScheme);
    select.value = savedScheme;

    // On theme change
    select.addEventListener("input", (event) => {
        const colorScheme = event.target.value;
        setColorScheme(colorScheme);
        localStorage.setItem("colorScheme", colorScheme);
    });

    function setColorScheme(colorScheme) {
        document.documentElement.style.setProperty("color-scheme", colorScheme);
        
        // Update meta theme-color for mobile browsers
        updateMetaThemeColor(colorScheme);
        
        // Announce to screen readers
        announceThemeChange(colorScheme);
    }
    
    function updateMetaThemeColor(colorScheme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const isDark = colorScheme === 'dark' || 
                      (colorScheme === 'light dark' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        metaThemeColor.content = isDark ? '#0a0e27' : '#ffffff';
    }
    
    function announceThemeChange(colorScheme) {
        const announcer = document.getElementById('theme-announcer');
        if (announcer) {
            const themeNames = {
                'light dark': 'automatic',
                'light': 'light',
                'dark': 'dark'
            };
            announcer.textContent = `Theme changed to ${themeNames[colorScheme]} mode`;
        }
    }
}

// ==========================================
// BACKGROUND MUSIC HANDLER (IMPROVED)
// ==========================================
function setupBackgroundMusic() {
    const backgroundMusic = document.getElementById('background-music');
    if (!backgroundMusic) return;

    // Only play on user interaction (better UX)
    let hasPlayed = false;
    
    const playMusic = () => {
        if (!hasPlayed) {
            backgroundMusic.muted = false;
            backgroundMusic.volume = 0.3; // Lower volume
            backgroundMusic.play().catch(() => {
                console.log('Auto-play prevented by browser');
            });
            
            // Fade out after 8 seconds
            setTimeout(() => {
                fadeOutMusic(backgroundMusic);
            }, 8000);
            
            hasPlayed = true;
        }
    };

    // Play on first user interaction
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, playMusic, { once: true });
    });
}

function fadeOutMusic(audio) {
    const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
            audio.pause();
            clearInterval(fadeInterval);
        }
    }, 100);
}

// ==========================================
// ENTER BUTTON ENHANCED INTERACTION
// ==========================================
function setupEnterButton() {
    const enterButton = document.getElementById("enter-button");
    if (!enterButton) return;

    enterButton.addEventListener("click", enterSite);
    
    // Keyboard accessibility
    enterButton.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            enterSite();
        }
    });

    // Add ripple effect on click
    enterButton.addEventListener("click", createRipple);
}

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Redirect to home.html with smooth transition
function enterSite() {
    const content = document.querySelector('.center-content');
    
    // Add exit animation
    content.style.animation = 'fadeOutDown 0.6s ease-in forwards';
    
    // Navigate after animation
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 600);
}

// ==========================================
// LOGO INTERACTION ENHANCEMENT
// ==========================================
function setupLogoInteraction() {
    const logoCircle = document.querySelector('.logo-circle');
    if (!logoCircle) return;

    // Add tilt effect on mouse move
    logoCircle.addEventListener('mousemove', (e) => {
        const rect = logoCircle.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        logoCircle.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    logoCircle.addEventListener('mouseleave', () => {
        logoCircle.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
}

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

// Reduce animations on low-power devices
function checkPerformance() {
    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.body.classList.add('reduce-motion');
    }
    
    // Disable particles on mobile for performance
    if (window.innerWidth < 768 || navigator.connection?.saveData) {
        const particles = document.querySelector('.particles');
        if (particles) particles.style.display = 'none';
    }
}

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================

// Create announcer for screen readers
function setupAccessibility() {
    const announcer = document.createElement('div');
    announcer.id = 'theme-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎨 Initializing landing page...");
    
    // Check performance settings
    checkPerformance();
    
    // Setup accessibility
    setupAccessibility();
    
    // Setup all interactions
    setupThemeSwitcher();
    setupBackgroundMusic();
    setupEnterButton();
    setupLogoInteraction();
    createParticles();
    
    // Trigger entrance animations
    setTimeout(() => {
        const content = document.querySelector(".center-content");
        if (content) content.classList.add("animated");
    }, 100);
    
    console.log("✨ Landing page ready!");
});

// ==========================================
// RESPONSIVE HANDLER
// ==========================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recreate particles on resize
        const particlesContainer = document.querySelector('.particles');
        if (particlesContainer && window.innerWidth >= 768) {
            particlesContainer.innerHTML = '';
            createParticles();
        }
    }, 250);
});

// CSS for screen-reader-only content and other styles
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeOutDown {
        to {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.9);
        }
    }
    
    .color-scheme {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
    }
    
    .color-scheme select {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        border: 2px solid var(--border-color, rgba(122, 207, 238, 0.3));
        background: var(--bg-elevated, rgba(10, 14, 39, 0.8));
        color: var(--text-primary, #f0f4f8);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        cursor: pointer;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.3));
    }
    
    .color-scheme select:hover {
        border-color: var(--accent-color, #7acfee);
        background: var(--bg-elevated, rgba(10, 14, 39, 0.95));
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.4));
    }
    
    .color-scheme select:focus {
        outline: 2px solid var(--accent-color, #7acfee);
        outline-offset: 2px;
    }
    
    @media (max-width: 768px) {
        .color-scheme {
            top: 0.5rem;
            right: 0.5rem;
        }
        
        .color-scheme select {
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
        }
    }
`;
document.head.appendChild(style);
