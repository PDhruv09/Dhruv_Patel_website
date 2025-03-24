console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// ✅ Ensure scripts run only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    generateNavigation();
    displayLatestProjects().catch(error => console.error("Error loading latest projects:", error));
    displayGitHubStats().catch(error => console.error("Error loading GitHub stats:", error)); // ✅ Load GitHub Stats
});

// ✅ Function to generate the navigation bar
function generateNavigation() {
    const rootPath = "/Dhruv_Patel_website/";
    const pages = [
        { url: "index.html", title: "Home" },
        { url: "home.html#about", title: "About Me" },
        { url: "home.html#resume", title: "Resume" },
        { url: "projects/index.html", title: "Projects" },
        { url: "meta/index.html", title: "Meta Analysis" },
        { url: "Contact/index.html", title: "Contact" },
        { url: "https://github.com/PDhruv09", title: "GitHub" }
    ];
    

    const nav = document.createElement("nav");
    nav.id = "navbar";

    pages.forEach((page) => {
        let url = page.url.startsWith("http") ? page.url : rootPath + page.url;
        const a = document.createElement("a");
        a.href = url;
        a.textContent = page.title;
        if (new URL(a.href, location.origin).href === location.href) {
            a.classList.add("current");
        }
        if (a.host !== location.host) {
            a.target = "_blank";
        }
        nav.appendChild(a);
    });

    document.body.prepend(nav);
}

// ✅ Dark Mode Toggle Implementation
document.addEventListener("DOMContentLoaded", () => {
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

    if ("colorScheme" in localStorage) {
        setColorScheme(localStorage.colorScheme);
        select.value = localStorage.colorScheme;
    }

    select.addEventListener("input", (event) => {
        const colorScheme = event.target.value;
        setColorScheme(colorScheme);
        localStorage.colorScheme = colorScheme;
    });

    function setColorScheme(colorScheme) {
        document.documentElement.style.setProperty("color-scheme", colorScheme);
    }
});

// ✅ Fix: Ensure GitHub API Fetch Works
async function fetchGitHubData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
        return await response.json(); // ✅ Fix: Convert response to JSON correctly
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}

// ✅ Display GitHub Stats on the Home Page
async function displayGitHubStats() {
    const profileStats = document.querySelector("#profile-stats");
    if (!profileStats) {
        console.warn("GitHub stats container not found.");
        return;
    }

    const githubData = await fetchGitHubData("PDhruv09"); // ✅ Use correct GitHub username

    if (githubData) {
        profileStats.style.display = "flex";
        profileStats.style.justifyContent = "center";
        profileStats.style.flexWrap = "wrap";
        profileStats.style.gap = "1rem";
    
        const stats = [
            { label: "Public Repos", value: githubData.public_repos },
            { label: "Public Gists", value: githubData.public_gists },
            { label: "Followers", value: githubData.followers },
            { label: "Following", value: githubData.following }
        ];
    
        stats.forEach(stat => {
            const card = document.createElement("div");
            card.className = "github-stat-card";
            card.innerHTML = `
                <h4>${stat.label}</h4>
                <p>${stat.value}</p>
            `;
            profileStats.appendChild(card);
        });
    } else {
        profileStats.innerHTML = `<p>Error loading GitHub data. Please try again later.</p>`;
    }
}

// ✅ Fetch & Load Project Data
async function loadProjectData(retries = 3, delay = 2000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch("/projects/assets/json/project.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error("Failed to fetch projects after multiple attempts.");
    return [];
}

// ✅ Display Latest Projects
async function displayLatestProjects() {
    const projectsContainer = document.querySelector(".latest-projects");
    if (!projectsContainer) {
        console.warn("Invalid container element for latest projects.");
        return;
    }

    const projectData = await loadProjectData();
    if (!projectData.length) {
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    function getLatestProjects() {
        return [...projectData]
            .sort((a, b) => parseInt(b.year) - parseInt(a.year))
            .slice(0, 3);
    }

    function renderProjects(projects) {
        projectsContainer.innerHTML = "";

        projectsContainer.style.display = "flex";
        projectsContainer.style.flexWrap = "wrap";
        projectsContainer.style.justifyContent = "center";
        projectsContainer.style.gap = "1rem";

        projects.forEach(project => {
            // Outer anchor
            const link = document.createElement("a");
            link.href = project.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "flip-card";

            // Inner flip container
            link.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img src="${project.image}" alt="${project.title}">
                    </div>
                    <div class="flip-card-back">
                        <h3>${project.title}</h3>
                        <p><strong>${project.year}</strong></p>
                        <p>${project.description}</p>
                    </div>
                </div>
            `;

            projectsContainer.appendChild(link);
        });
    }
    renderProjects(getLatestProjects());
}

// ✅ Run after DOM loads
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await displayLatestProjects();
        await displayGitHubStats(); // ✅ Ensure GitHub stats load correctly
    } catch (error) {
        console.error("Error loading content:", error);
    }
});
