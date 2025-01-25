console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Step 3.1: Adding the Navigation Menu Dynamically
document.addEventListener("DOMContentLoaded", () => {
    const pages = [
        { url: "index.html", title: "Home" },
        { url: "home.html#about", title: "About Me" },
        { url: "home.html#resume", title: "Resume" },
        { url: "projects/index.html", title: "Projects" },
        { url: "contact/index.html", title: "Contact" },
        { url: "https://github.com/PDhruv09", title: "GitHub" },
    ];

    // Detect if we are on the home page
    const ARE_WE_HOME = document.documentElement.classList.contains("home");

    // Create a new <nav> element and prepend it to the <body>
    const nav = document.createElement("nav");
    nav.id = "navbar";
    document.body.prepend(nav);

    // Dynamically add links to the navigation menu
    for (let page of pages) {
        let url = page.url;

        // Adjust relative paths for pages outside the home directory
        if (!ARE_WE_HOME && !url.startsWith("http")) {
            url = "../" + url;
        }

        // Create the <a> element
        const a = document.createElement("a");
        a.href = url;
        a.textContent = page.title;

        // Highlight the current page
        if (a.host === location.host && a.pathname === location.pathname) {
            a.classList.add("current");
        }

        // Open external links in a new tab
        if (a.host !== location.host) {
            a.target = "_blank";
        }

        // Append the link to the <nav>
        nav.appendChild(a);
    }
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
