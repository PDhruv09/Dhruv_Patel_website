console.log("IT'S ALIVE!");

// Helper function to select multiple elements
function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// ✅ Fix: Ensure script runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    generateNavigation();
    displayLatestProjects().catch(error => console.error("Error loading latest projects:", error));
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
        const response = await fetch(`https://api.github.com/users/${pdhruv09}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}

// ✅ Fix: Load project data correctly
async function loadProjectData() {
    try {
        const response = await fetch("/projects/assets/json/project.json"); // Fixed path
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching or parsing JSON data:", error);
        return [];
    }
}

// ✅ Fix: Ensure projects are displayed correctly
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

    // ✅ Function to get latest 3 projects
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
