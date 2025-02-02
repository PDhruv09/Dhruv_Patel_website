import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener("DOMContentLoaded", async () => {
    const projectsContainer = document.querySelector(".projects");
    if (!projectsContainer) return;

    const projects = await fetchJSON("../json/projects.json");
    if (!projects) return;

    renderProjects(projects, projectsContainer, "h2");
});