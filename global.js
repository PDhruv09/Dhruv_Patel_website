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

// ✅ Fix: Ensure JSON fetch works
async function fetchGitHubData(username) {
    try {
        const response = await fetchJSON(`https://api.github.com/users/PDhruv09`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
        return await response.json();
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


async function loadProjectData(retries = 3, delay = 2000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch("/Dhruv_Patel_website/projects/assets/json/project.json");
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
        projects.forEach(project => {
            const article = document.createElement("article");
            article.innerHTML = `
                <h2>${project.title}</h2>
                <img src="${project.image}" alt="${project.title}">
                <p>${project.description}</p>
            `;
            projectsContainer.appendChild(article);
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
