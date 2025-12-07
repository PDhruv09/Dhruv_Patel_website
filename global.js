console.log("IT'S ALIVE! 🚀");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Debounce utility for performance
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// NAVIGATION GENERATION (ENHANCED)
// ==========================================
function generateNavigation() {
    const rootPath = "/Dhruv_Patel_website/";
    const pages = [
        { url: "", title: "Home", icon: "🏠" },
        { url: "home.html#about", title: "About", icon: "👤" },
        { url: "home.html#resume", title: "Resume", icon: "📄" },
        { url: "Blogs/", title: "Blog", icon: "✍️" },
        { url: "projects/", title: "Projects", icon: "🚀" },
        { url: "meta/", title: "Meta", icon: "📊" },
        { url: "Contact/", title: "Contact", icon: "📧" },
        { url: "https://github.com/PDhruv09", title: "GitHub", icon: "💻" }
    ];

    const nav = document.createElement("nav");
    nav.id = "navbar";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Main navigation");

    pages.forEach((page) => {
        let url = page.url.startsWith("http") ? page.url : rootPath + page.url;
        const a = document.createElement("a");
        a.href = url;
        
        // Add icon for mobile (hidden on desktop via CSS)
        a.innerHTML = `
            <span class="nav-icon" aria-hidden="true">${page.icon}</span>
            <span class="nav-text">${page.title}</span>
        `;
        
        // Highlight current page
        const currentUrl = new URL(a.href, location.origin).href;
        const locationUrl = location.href.split('#')[0]; // Ignore hash for comparison
        
        if (currentUrl === locationUrl || currentUrl === locationUrl + '/') {
            a.classList.add("current");
            a.setAttribute("aria-current", "page");
        }
        
        // Open external links in new tab
        if (a.host !== location.host) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.setAttribute("aria-label", `${page.title} (opens in new tab)`);
        }
        
        nav.appendChild(a);
    });

    document.body.prepend(nav);
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
        
        metaThemeColor.content = isDark ? '#0f172a' : '#ffffff';
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
// GITHUB STATS (ENHANCED)
// ==========================================
async function fetchGitHubData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}

async function displayGitHubStats() {
    const profileStats = document.querySelector("#profile-stats");
    if (!profileStats) {
        console.warn("GitHub stats container not found.");
        return;
    }

    // Show loading state
    profileStats.setAttribute("aria-busy", "true");
    profileStats.innerHTML = `
        <div class="loading-spinner" role="status">
            <span class="sr-only">Loading GitHub statistics...</span>
            <div class="spinner"></div>
        </div>
    `;

    const githubData = await fetchGitHubData("PDhruv09");

    if (githubData) {
        profileStats.setAttribute("aria-busy", "false");
        profileStats.innerHTML = '';
        
        const stats = [
            { 
                label: "Public Repos", 
                value: githubData.public_repos,
                icon: "📦",
                color: "#667eea"
            },
            { 
                label: "Public Gists", 
                value: githubData.public_gists,
                icon: "📝",
                color: "#7acfee"
            },
            { 
                label: "Followers", 
                value: githubData.followers,
                icon: "👥",
                color: "#22c55e"
            },
            { 
                label: "Following", 
                value: githubData.following,
                icon: "🔗",
                color: "#f59e0b"
            }
        ];
    
        stats.forEach((stat, index) => {
            const card = document.createElement("div");
            card.className = "github-stat-card";
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="stat-icon" aria-hidden="true">${stat.icon}</div>
                <h4>${stat.label}</h4>
                <p class="stat-value" style="color: ${stat.color}">${stat.value}</p>
            `;
            profileStats.appendChild(card);
        });
    } else {
        profileStats.setAttribute("aria-busy", "false");
        profileStats.innerHTML = `
            <div class="error-message" role="alert">
                <p>⚠️ Unable to load GitHub statistics. Please try again later.</p>
            </div>
        `;
    }
}

// ==========================================
// PROJECT DATA (ENHANCED)
// ==========================================
async function loadProjectData(retries = 3, delay = 2000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch("/Dhruv_Patel_website/projects/assets/json/project.json", {
                cache: "no-cache"
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            
            if (attempt < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
    
    console.error("Failed to fetch projects after multiple attempts.");
    return [];
}

async function displayLatestProjects() {
    const projectsContainer = document.querySelector(".latest-projects");
    if (!projectsContainer) {
        console.warn("Invalid container element for latest projects.");
        return;
    }

    // Show loading state
    projectsContainer.innerHTML = `
        <div class="loading-spinner" role="status">
            <span class="sr-only">Loading latest projects...</span>
            <div class="spinner"></div>
        </div>
    `;

    const projectData = await loadProjectData();
    
    if (!projectData.length) {
        projectsContainer.innerHTML = `
            <div class="error-message" role="alert">
                <p>⚠️ No projects available at the moment.</p>
            </div>
        `;
        return;
    }

    function getLatestProjects() {
        return [...projectData]
            .sort((a, b) => parseInt(b.year) - parseInt(a.year))
            .slice(0, 3);
    }

    function renderProjects(projects) {
        projectsContainer.innerHTML = "";

        projects.forEach((project, index) => {
            const link = document.createElement("a");
            link.href = project.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "flip-card";
            link.setAttribute("aria-label", `View ${project.title} project`);
            link.style.animationDelay = `${index * 0.15}s`;

            // Fix image path
            const imagePath = project.image.replace(/^(\.\.\/)+/, '');
            
            link.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img src="${imagePath}" alt="${project.title} preview" loading="lazy">
                    </div>
                    <div class="flip-card-back">
                        <h3>${project.title}</h3>
                        <p class="project-year"><strong>${project.year}</strong></p>
                        <p class="project-description">${project.description}</p>
                        <span class="view-project-btn" aria-hidden="true">View Project →</span>
                    </div>
                </div>
            `;

            projectsContainer.appendChild(link);
        });
    }
    
    renderProjects(getLatestProjects());
}

// ==========================================
// SMOOTH SCROLL ENHANCEMENT
// ==========================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Don't prevent default for # only links
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, href);
                
                // Focus target for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
}

// ==========================================
// INTERSECTION OBSERVER (FADE IN ON SCROLL)
// ==========================================
function setupScrollAnimations() {
    // Check if animations should be reduced
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in-target');
        observer.observe(section);
    });
}

// ==========================================
// MOBILE MENU ENHANCEMENTS
// ==========================================
function setupMobileMenu() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Add scroll listener to hide/show navbar on mobile
    let lastScroll = 0;
    const scrollThreshold = 100;

    const handleScroll = debounce(() => {
        const currentScroll = window.pageYOffset;
        
        if (window.innerWidth <= 768) {
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                navbar.classList.add('navbar-hidden');
            } else {
                navbar.classList.remove('navbar-hidden');
            }
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScroll = currentScroll;
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
function logPerformanceMetrics() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('📊 Performance Metrics:');
                    console.log(`  DOM Content Loaded: ${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`);
                    console.log(`  Page Load Complete: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
                }
            }, 0);
        });
    }
}

// ==========================================
// ACCESSIBILITY HELPERS
// ==========================================
function setupAccessibility() {
    // Create live region for announcements
    const announcer = document.createElement('div');
    announcer.id = 'theme-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Keyboard trap prevention
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modals/menus
            document.activeElement.blur();
        }
    });
}

// ==========================================
// IMAGE LAZY LOADING FALLBACK
// ==========================================
function setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        return;
    }

    // Fallback for older browsers
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ==========================================
// ERROR HANDLING
// ==========================================
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // You could send this to an analytics service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could send this to an analytics service
});

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎨 Initializing global scripts...");
    
    try {
        // Setup core functionality
        generateNavigation();
        setupThemeSwitcher();
        setupAccessibility();
        setupSmoothScroll();
        setupMobileMenu();
        setupLazyLoading();
        setupScrollAnimations();
        
        // Load dynamic content
        await Promise.allSettled([
            displayLatestProjects(),
            displayGitHubStats()
        ]);
        
        // Performance monitoring (development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            logPerformanceMetrics();
        }
        
        console.log("✅ Global scripts initialized successfully!");
        
    } catch (error) {
        console.error("❌ Error during initialization:", error);
    }
});

// ==========================================
// RESPONSIVE HANDLER
// ==========================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('📱 Window resized, re-checking layout');
        // Re-initialize mobile menu if needed
        setupMobileMenu();
    }, 250);
}, { passive: true });

// ==========================================
// SERVICE WORKER REGISTRATION (OPTIONAL)
// ==========================================
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('✅ Service Worker registered'))
        //     .catch(err => console.log('❌ Service Worker registration failed'));
    });
}

// ==========================================
// ADDITIONAL STYLES (INJECTED)
// ==========================================
const globalStyles = document.createElement('style');
globalStyles.textContent = `
    /* Screen reader only */
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
    
    /* Skip link */
    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--accent-color, #7acfee);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
        z-index: 10000;
    }
    
    .skip-link:focus {
        top: 0;
    }
    
    /* Loading spinner */
    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        flex-direction: column;
        gap: 1rem;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(122, 207, 238, 0.2);
        border-top-color: #7acfee;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Error message */
    .error-message {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary, #666);
    }
    
    /* Fade in animations */
    .fade-in-target {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-up {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Mobile navbar hide on scroll */
    .navbar-hidden {
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }
    
    /* Navigation icons (mobile only) */
    .nav-icon {
        display: none;
    }
    
    @media (max-width: 640px) {
        .nav-icon {
            display: inline;
            margin-right: 0.25rem;
        }
        
        .nav-text {
            font-size: 0.85rem;
        }
    }
    
    /* Theme switcher positioning */
    .color-scheme {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1001;
    }
    
    .color-scheme select {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        border: 2px solid var(--border-color, #e2e8f0);
        background: var(--bg-elevated, #ffffff);
        color: var(--text-primary, #0f172a);
        font-family: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
    }
    
    .color-scheme select:hover {
        border-color: var(--accent-color, #7acfee);
        box-shadow: var(--shadow-md);
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
    
    /* GitHub stat cards animation */
    .github-stat-card {
        opacity: 0;
        animation: slideInUp 0.5s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .stat-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    /* Project cards animation */
    .flip-card {
        opacity: 0;
        animation: fadeInScale 0.5s ease forwards;
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .view-project-btn {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2rem;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .fade-in-target {
            opacity: 1;
            transform: none;
        }
    }
`;
document.head.appendChild(globalStyles);

// Export functions for potential use in other scripts
window.AppGlobal = {
    fetchGitHubData,
    loadProjectData,
    setupThemeSwitcher,
    debounce
};
