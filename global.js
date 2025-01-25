console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Generate Navigation Menu
document.addEventListener("DOMContentLoaded", () => {
    const pages = [
        { url: "index.html", title: "Home" },
        { url: "home.html#about", title: "About Me" },
        { url: "home.html#resume", title: "Resume" },
        { url: "projects/index.html", title: "Projects" },
        { url: "contact/index.html", title: "Contact" },
        { url: "https://github.com/PDhruv09", title: "GitHub" },
    ];

    const nav = document.createElement("nav");
    nav.id = "navbar";

    // GitHub Pages project repository base
    const baseURL = "/Dhruv_Patel_website/";

    pages.forEach((page) => {
        let url = page.url;

        // Prepend the repository name to internal links
        if (!url.startsWith("http")) {
            url = baseURL + url;
        }

        const a = document.createElement("a");
        a.href = url;
        a.textContent = page.title;

        // Highlight the current page
        const currentPath = location.pathname.replace(baseURL, ""); // Adjust for base URL
        if (a.href.includes(currentPath)) {
            a.classList.add("current");
        }

        // Open external links in a new tab
        if (a.host !== location.host) {
            a.target = "_blank";
        }

        nav.appendChild(a);
    });

    // Prepend navigation to the body
    document.body.prepend(nav);
});

// Step 4: Dark Mode Toggle Across All Pages
document.addEventListener("DOMContentLoaded", () => {
    // Add the dark mode switcher to the top of the page
    document.body.insertAdjacentHTML(
        "afterbegin",
        `
        <label class="color-scheme" style="position: absolute; top: 10px; right: 10px;">
            Theme:
            <select id="theme-switcher">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>
    `);

    const select = document.getElementById("theme-switcher");

    // Apply saved theme preference on page load
    if ("colorScheme" in localStorage) {
        setColorScheme(localStorage.colorScheme);
        select.value = localStorage.colorScheme;
    }

    // Change the theme when the user selects a new option
    select.addEventListener("input", (event) => {
        const colorScheme = event.target.value;
        setColorScheme(colorScheme);
        localStorage.colorScheme = colorScheme; // Save the preference
    });

    // Function to apply the theme
    function setColorScheme(colorScheme) {
        document.documentElement.style.setProperty("color-scheme", colorScheme);
    }
});
