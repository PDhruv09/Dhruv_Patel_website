import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener("DOMContentLoaded", async () => {
    const projectsContainer = document.querySelector(".projects");
    const searchInput = document.querySelector(".searchBar");
    const svg = d3.select("svg");
    const legend = d3.select(".legend");
    let selectedIndex = -1;
    let query = "";

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            query = event.target.value.toLowerCase();
            let filteredProjects = projectData.filter(p => 
                Object.values(p).join(" ").toLowerCase().includes(query)
            );
            renderProjects(filteredProjects);
            renderPieChart(filteredProjects);
        });
    } else {
        console.warn("Search input not found on this page.");
    }

    async function fetchProjectData(retries = 3, delay = 2000) {
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

    function renderProjects(projects) {
        if (!projectsContainer) {
            console.error("Projects container not found! Ensure .projects exists in projects/index.html.");
            return;
        }

        projectsContainer.innerHTML = "";
        projects.forEach(project => {
            const projectElement = document.createElement("article");
            projectElement.innerHTML = `
                <h2>${project.title}</h2>
                <p>${project.year}</p>
                <p>${project.description}</p>
            `;
            projectsContainer.appendChild(projectElement);
        });
    }

    function renderPieChart(filteredProjects) {
        if (!filteredProjects.length) {
            console.warn("No projects to display in pie chart.");
            return;
        }

        svg.selectAll("*").remove();
        legend.selectAll("*").remove();

        let yearCounts = d3.rollups(filteredProjects, v => v.length, d => d.year);
        let data = yearCounts.map(([year, count]) => ({ label: year, value: count }));

        let width = 200, height = 200, radius = Math.min(width, height) / 2;
        let pie = d3.pie().value(d => d.value);
        let arc = d3.arc().innerRadius(0).outerRadius(radius);
        let color = d3.scaleOrdinal(d3.schemeTableau10);

        let chart = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        let arcs = pie(data);

        chart.selectAll("path")
            .data(arcs)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (_, i) => color(i))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("click", (_, i) => {
                selectedIndex = selectedIndex === i ? -1 : i;
                renderProjects(selectedIndex === -1 ? filteredProjects : filteredProjects.filter(p => p.year === data[i].label));
            });

        let legendItems = legend.selectAll("li")
            .data(data)
            .enter()
            .append("li")
            .style("--color", (_, i) => color(i))
            .on("click", (_, i) => {
                selectedIndex = selectedIndex === i ? -1 : i;
                renderProjects(selectedIndex === -1 ? filteredProjects : filteredProjects.filter(p => p.year === data[i].label));
            });

        legendItems.append("span").attr("class", "swatch");
        legendItems.append("span").text(d => `${d.label} (${d.value})`);
    }

    let projectData = await fetchProjectData();
    if (!projectData.length) {
        console.error("No project data found. Check if project.json is correctly loaded.");
    } else {
        renderProjects(projectData);
        renderPieChart(projectData);
    }
});
