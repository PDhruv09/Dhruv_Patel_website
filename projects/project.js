import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("🎨 Projects page loading...");

// ==========================================
// CONFIGURATION
// ==========================================
const PIE_RADIUS = 40;
const colors = d3.schemeCategory10;

// State
let selectedYear = null;
let projectData = [];
let yearColorMap = new Map();

// DOM Elements
const pieChart = d3.select("#projects-pie-chart");
const projectContainer = d3.select(".projects");
const buttonContainer = d3.select(".button-row");

// ==========================================
// LOAD PROJECT DATA
// ==========================================
async function loadProjectData() {
    try {
        // Show loading state
        projectContainer.html('<div class="loading"><div class="spinner"></div></div>');
        
        const data = await d3.json("assets/json/project.json");
        
        if (!data || data.length === 0) {
            throw new Error("No project data available");
        }
        
        console.log(`✅ Loaded ${data.length} projects`);
        return data;
        
    } catch (error) {
        console.error("❌ Error loading projects:", error);
        projectContainer.html(`
            <div class="error-message" role="alert">
                <p>⚠️ Unable to load projects. Please try again later.</p>
            </div>
        `);
        return [];
    }
}

// ==========================================
// INITIALIZE
// ==========================================
async function init() {
    projectData = await loadProjectData();
    
    if (projectData.length === 0) return;
    
    // Calculate year counts
    const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
    const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));

    // Assign colors to years
    pieData.forEach((d, i) => yearColorMap.set(d.year, colors[i % colors.length]));

    // Render everything
    renderButtons(pieData);
    drawPieChart(pieData);
    renderProjects();
    
    console.log("✨ Projects page ready!");
}

// ==========================================
// RENDER FILTER BUTTONS
// ==========================================
function renderButtons(pieData) {
    buttonContainer.html("");

    pieData.forEach((d, i) => {
        const button = buttonContainer.append("button")
            .text(`${d.year} (${d.count} project${d.count > 1 ? 's' : ''})`)
            .attr("data-year", d.year)
            .attr("aria-pressed", "false")
            .style("background-color", colors[i % colors.length])
            .on("click", function() {
                // Toggle selection
                selectedYear = selectedYear === d.year ? null : d.year;
                
                // Update button states
                buttonContainer.selectAll("button")
                    .attr("aria-pressed", "false")
                    .style("opacity", selectedYear ? 0.5 : 1);
                
                if (selectedYear) {
                    d3.select(this)
                        .attr("aria-pressed", "true")
                        .style("opacity", 1);
                }
                
                // Re-render
                renderProjects();
                updatePieHighlight();
                
                // Announce to screen readers
                const message = selectedYear 
                    ? `Filtered to show ${d.count} project${d.count > 1 ? 's' : ''} from ${selectedYear}`
                    : "Showing all projects";
                announceToScreenReader(message);
            });
    });

    // Clear filter button
    d3.select("#clear-filter").on("click", () => {
        selectedYear = null;
        
        // Reset button states
        buttonContainer.selectAll("button")
            .attr("aria-pressed", "false")
            .style("opacity", 1);
        
        renderProjects();
        updatePieHighlight();
        announceToScreenReader("Showing all projects");
    });
}

// ==========================================
// DRAW PIE CHART
// ==========================================
function drawPieChart(pieData) {
    pieChart.selectAll("*").remove();

    const arcGen = d3.arc()
        .innerRadius(0)
        .outerRadius(PIE_RADIUS);
    
    const pieGen = d3.pie()
        .sort(null)
        .value(d => d.count);
    
    const arcs = pieGen(pieData);

    // Draw slices
    const slices = pieChart.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcGen)
        .attr("fill", d => yearColorMap.get(d.data.year))
        .attr("opacity", d => selectedYear && d.data.year !== selectedYear ? 0.3 : 1)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            // Click on pie slice to filter
            selectedYear = selectedYear === d.data.year ? null : d.data.year;
            renderProjects();
            updatePieHighlight();
            
            // Update buttons
            buttonContainer.selectAll("button")
                .attr("aria-pressed", function() {
                    return d3.select(this).attr("data-year") === selectedYear ? "true" : "false";
                })
                .style("opacity", function() {
                    const year = d3.select(this).attr("data-year");
                    return !selectedYear || year === selectedYear ? 1 : 0.5;
                });
            
            const message = selectedYear 
                ? `Filtered to show projects from ${selectedYear}`
                : "Showing all projects";
            announceToScreenReader(message);
        });

    // Add labels
    pieChart.selectAll("text")
        .data(arcs)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arcGen.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .style("pointer-events", "none")
        .text(d => d.data.year);
}

// ==========================================
// UPDATE PIE CHART HIGHLIGHT
// ==========================================
function updatePieHighlight() {
    const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
    const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));
    drawPieChart(pieData);
}

// ==========================================
// RENDER PROJECTS
// ==========================================
function renderProjects() {
    projectContainer.attr("aria-busy", "true");
    projectContainer.html("");

    let displayProjects = [];

    if (selectedYear) {
        // Show all projects from selected year
        displayProjects = projectData.filter(p => p.year === selectedYear);
    } else {
        // Show one featured project per year
        const grouped = d3.groups(projectData, d => d.year);
        grouped.forEach(([year, projects]) => {
            // Sort by title and pick first (or you could add a 'featured' flag to JSON)
            const featured = projects.sort((a, b) => b.title.localeCompare(a.title))[0];
            displayProjects.push(featured);
        });
        
        // Sort by year descending
        displayProjects.sort((a, b) => b.year.localeCompare(a.year));
    }

    if (displayProjects.length === 0) {
        projectContainer.html(`
            <div class="error-message" role="alert">
                <p>No projects found for the selected year.</p>
            </div>
        `);
        projectContainer.attr("aria-busy", "false");
        return;
    }

    // Render each project
    displayProjects.forEach((project, index) => {
        const flipCard = projectContainer.append("a")
            .attr("href", project.link)
            .attr("target", "_blank")
            .attr("rel", "noopener noreferrer")
            .attr("class", "flip-card")
            .attr("role", "listitem")
            .attr("aria-label", `${project.title}, ${project.year}. Click to view project.`)
            .style("animation-delay", `${index * 0.1}s`);

        const inner = flipCard.append("div")
            .attr("class", "flip-card-inner");

        // Front of card
        const front = inner.append("div")
            .attr("class", "flip-card-front");
        
        front.append("img")
            .attr("src", project.image)
            .attr("alt", `${project.title} preview`)
            .attr("loading", "lazy");

        // Back of card
        const back = inner.append("div")
            .attr("class", "flip-card-back");
        
        back.append("h3").text(project.title);
        
        back.append("p")
            .style("font-weight", "bold")
            .text(project.year);
        
        back.append("p")
            .style("font-size", "0.9rem")
            .text(project.description);
        
        back.append("div")
            .attr("class", "view-btn")
            .text("View Project →");
    });

    projectContainer.attr("aria-busy", "false");
}

// ==========================================
// SCREEN READER ANNOUNCEMENTS
// ==========================================
function announceToScreenReader(message) {
    let announcer = document.getElementById("project-announcer");
    
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "project-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.style.position = "absolute";
        announcer.style.left = "-10000px";
        announcer.style.width = "1px";
        announcer.style.height = "1px";
        announcer.style.overflow = "hidden";
        document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
}

// ==========================================
// RESPONSIVE BEHAVIOR
// ==========================================
window.addEventListener('resize', debounce(() => {
    // Redraw pie chart on resize
    if (projectData.length > 0) {
        updatePieHighlight();
    }
}, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// START
// ==========================================
init();