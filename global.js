console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Generate Navigation Menu
document.addEventListener("DOMContentLoaded", () => {
    const rootPath = "/Dhruv_Patel_website/"; // Root directory of your project
    const pages = [
        { url: "index.html", title: "Home" },
        { url: "home.html#about", title: "About Me" },
        { url: "home.html#resume", title: "Resume" },
        { url: "projects/index.html", title: "Projects" },
        { url: "Contact/index.html", title: "Contact" },
        { url: "https://github.com/PDhruv09", title: "GitHub" },
    ];

    const nav = document.createElement("nav");
    nav.id = "navbar";

    pages.forEach((page) => {
        let url = page.url;

        // Add the root path to relative URLs
        if (!url.startsWith("http")) {
            url = rootPath + url;
        }

        const a = document.createElement("a");
        a.href = url;
        a.textContent = page.title;

        // Highlight the current page
        const fullURL = new URL(a.href, location.origin).href; // Resolve absolute URL
        if (fullURL === location.href) {
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

// ✅ NEW FUNCTION: Fetch GitHub Data (Fixing Undefined Error)
async function fetchGitHubData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}

// ✅ UPDATED: Correcting projects.json Fetch Path
let projectData = [];

// Function to fetch and cache project data
async function loadProjectData() {
    try {
        const response = await fetch("projects/assets/json/projects.json"); // Corrected Path
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        projectData = await response.json();
    } catch (error) {
        console.error("Error fetching or parsing JSON data:", error);
    }
}

// Function to get the latest 3 projects sorted by year (without modifying the original data)
function getLatestProjects() {
    if (!projectData || projectData.length === 0) {
        console.error("Project data is empty or not loaded.");
        return [];
    }

    return [...projectData] // Clone the array to avoid modifying cached data
        .sort((a, b) => parseInt(b.year) - parseInt(a.year)) // Sort by year (descending)
        .slice(0, 3); // Get latest 3 projects
}

// Function to render projects dynamically
function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error("Invalid container element for projects.");
        return;
    }

    containerElement.innerHTML = ''; // Clear existing content

    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
        `;
        containerElement.appendChild(article);
    });
}

// Function to load and display latest projects
async function displayLatestProjects() {
    await loadProjectData(); // Fetch data once before proceeding

    const latestProjects = getLatestProjects(); // Get latest 3 projects
    const projectsContainer = document.querySelector('.latest-projects'); // Ensure this class exists

    if (!projectsContainer) {
        console.error("Invalid container element for latest projects.");
        return;
    }

    if (latestProjects.length === 0) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    renderProjects(latestProjects, projectsContainer, 'h2'); // Render projects
}

// Ensure projects are displayed only when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    displayLatestProjects();
});

// ✅ UPDATED: Ensure GitHub Data is Loaded
document.addEventListener("DOMContentLoaded", async () => {
    if (window.location.pathname.includes("home.html")) {
        const profileStats = document.querySelector("#profile-stats");
        if (profileStats) {
            const githubData = await fetchGitHubData("PDhruv09");
            if (githubData) {
                profileStats.innerHTML = `
                    <dl>
                        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                        <dt>Followers:</dt><dd>${githubData.followers}</dd>
                        <dt>Following:</dt><dd>${githubData.following}</dd>
                    </dl>
                `;
            } else {
                profileStats.innerHTML = `<p>Error loading GitHub data. Please try again later.</p>`;
            }
        }
    }
});
