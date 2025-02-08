import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener("DOMContentLoaded", async () => {
    const projectsContainer = document.querySelector(".projects");
    const searchInput = document.querySelector(".searchBar");
    const svg = d3.select("svg");
    const legend = d3.select(".legend");
    let selectedIndex = -1;  // Tracks selected pie slice
    let query = "";

    // Load project data
    async function fetchProjectData() {
        try {
            const response = await fetch("../json/projects.json");
            if (!response.ok) throw new Error("Failed to fetch projects");
            return await response.json();
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    }

    // Function to render projects
    function renderProjects(projects) {
        projectsContainer.innerHTML = ""; // Clear existing content
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

    // Function to render pie chart
    function renderPieChart(filteredProjects) {
        // Clear previous chart & legend
        svg.selectAll("*").remove();
        legend.selectAll("*").remove();

        // Count projects per year
        let yearCounts = d3.rollups(filteredProjects, v => v.length, d => d.year);
        let data = yearCounts.map(([year, count]) => ({ label: year, value: count }));

        if (data.length === 0) return;  // Prevent errors on empty search

        // Pie chart layout
        let width = 200, height = 200, radius = Math.min(width, height) / 2;
        let pie = d3.pie().value(d => d.value);
        let arc = d3.arc().innerRadius(0).outerRadius(radius);
        let color = d3.scaleOrdinal(d3.schemeTableau10);

        // Append pie chart
        let chart = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        let arcs = pie(data);

        // Draw pie slices
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

        // Create legend
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

    // Event listener for search bar
    searchInput.addEventListener("input", (event) => {
        query = event.target.value.toLowerCase();
        let filteredProjects = projectData.filter(p => Object.values(p).join(" ").toLowerCase().includes(query));
        renderProjects(filteredProjects);
        renderPieChart(filteredProjects);
    });

    // Load and display data
    let projectData = await fetchProjectData();
    renderProjects(projectData);
    renderPieChart(projectData);
});
