import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PIE_RADIUS = 40;
const colors = d3.schemeCategory10;
let selectedYear = null;
let projectData = [];
let yearColorMap = new Map();

const pieChart = d3.select("#projects-pie-chart");
const projectContainer = d3.select(".projects");
const buttonContainer = d3.select(".button-row");

// Load project data
d3.json("assets/json/project.json").then(data => {
  projectData = data;

  const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
  const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }));

  pieData.forEach((d, i) => yearColorMap.set(d.year, colors[i]));

  renderButtons(pieData);
  drawPieChart(pieData);
  renderProjects(); // Show one per year initially
});

// Render buttons with project count
function renderButtons(pieData) {
  buttonContainer.html("");

  pieData.forEach((d, i) => {
    buttonContainer.append("button")
      .text(`${d.year} (${d.count} projects)`)
      .attr("data-year", d.year)
      .style("background-color", colors[i])
      .on("click", () => {
        selectedYear = selectedYear === d.year ? null : d.year;
        renderProjects();
        updatePieHighlight();
      });
  });

  d3.select("#clear-filter").on("click", () => {
    selectedYear = null;
    renderProjects();
    updatePieHighlight();
  });
}

// Draw pie chart with highlight and labels
function drawPieChart(pieData) {
  pieChart.selectAll("*").remove();

  const arcGen = d3.arc().innerRadius(0).outerRadius(PIE_RADIUS);
  const pieGen = d3.pie().sort(null).value(d => d.count);
  const arcs = pieGen(pieData);
  const total = d3.sum(pieData.map(d => d.count));

  pieChart.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arcGen)
    .attr("fill", d => yearColorMap.get(d.data.year))
    .attr("opacity", d => selectedYear && d.data.year !== selectedYear ? 0.2 : 1)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

  pieChart.selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arcGen.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "#fff")
    .text(d => `${d.data.year}`)
}

function updatePieHighlight() {
  const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
  const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }));
  drawPieChart(pieData);
}

// Render projects
function renderProjects() {
  projectContainer.html("");

  let displayProjects = [];

  if (selectedYear) {
    displayProjects = projectData.filter(p => p.year === selectedYear);
  } else {
    // Show one project per year
    const grouped = d3.groups(projectData, d => d.year);
    grouped.forEach(([year, projects]) => {
      const featured = projects.sort((a, b) => b.title.localeCompare(a.title))[0];
      displayProjects.push(featured);
    });
  }

  displayProjects.forEach(project => {
    const flipCard = projectContainer.append("a")
      .attr("href", project.link)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .attr("class", "flip-card");

    const inner = flipCard.append("div").attr("class", "flip-card-inner");

    // Front of card
    const front = inner.append("div").attr("class", "flip-card-front");
    front.append("img")
      .attr("src", project.image)
      .attr("alt", project.title);

    // Back of card
    const back = inner.append("div").attr("class", "flip-card-back");
    back.append("h3").text(project.title);
    back.append("p").text(project.year);
    back.append("p").text(project.description);
    back.append("div")
      .attr("class", "view-btn")
      .text("View Project");
  });
}
