console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Step 2: Automatic current page link
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = $$("nav a");
    let currentLink = navLinks.find(
        (a) => a.host === location.host && a.pathname === location.pathname
    );
    currentLink?.classList.add("current");
});

// Step 3: Automatic navigation menu
document.addEventListener('DOMContentLoaded', () => {
    const pages = [
        { url: "index.html", title: "Home" },
        { url: "home.html", title: "About Me" },
        { url: "resume.html", title: "Resume" },
        { url: "projects/index.html", title: "Projects" },
        { url: "contact/index.html", title: "Contact" },
        { url: "https://github.com/PDhruv09", title: "GitHub" }
    ];

    // Check if we are on the home page
    const ARE_WE_HOME = document.documentElement.classList.contains("home");

    let nav = document.createElement("nav");
    document.body.prepend(nav);

    for (let p of pages) {
        let url = p.url;
        if (!ARE_WE_HOME && !url.startsWith("http")) {
            url = "../" + url;
        }

        let a = document.createElement("a");
        a.href = url;
        a.textContent = p.title;
        if (a.host === location.host && a.pathname === location.pathname) {
            a.classList.add("current");
        }
        if (a.host !== location.host) {
            a.target = "_blank";
        }
        nav.append(a);
    }
});

// Step 4: Dark mode toggle
document.addEventListener('DOMContentLoaded', () => {
    // Add the dark mode switcher
    document.body.insertAdjacentHTML(
        "afterbegin",
        `
        <label class="color-scheme">
            Theme:
            <select id="theme-switcher">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>
    `);

    const select = document.getElementById("theme-switcher");

    // Apply saved preference on page load
    if ("colorScheme" in localStorage) {
        setColorScheme(localStorage.colorScheme);
        select.value = localStorage.colorScheme;
    }

    // Add event listener for theme switcher
    select.addEventListener("input", (event) => {
        const colorScheme = event.target.value;
        setColorScheme(colorScheme);
        localStorage.colorScheme = colorScheme;
    });

    function setColorScheme(colorScheme) {
        document.documentElement.style.setProperty("color-scheme", colorScheme);
    }
});