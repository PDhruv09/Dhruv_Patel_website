// const JSON_PATH = 'assets/json/project.json';
// let allProjects = [];
// let currentYear = null;
// let pieChart = null;

// const canvas = document.getElementById('projects-pie-canvas');
// const legend = document.querySelector('.legend');
// const projectsContainer = document.querySelector('.projects');

// const colors = ['#ff6b6b', '#6bcff6', '#81f77b', '#f7d66b', '#a56bf6', '#ff9f40', '#4bc0c0'];

// fetch(JSON_PATH)
//   .then(res => res.json())
//   .then(data => {
//     allProjects = data;
//     const onePerYear = Object.values(groupBy(allProjects, 'year')).map(g => g[0]);
//     render(onePerYear);
//   });

// function groupBy(arr, key) {
//   return arr.reduce((acc, obj) => {
//     (acc[obj[key]] = acc[obj[key]] || []).push(obj);
//     return acc;
//   }, {});
// }

// function countProjectsByYear(projects) {
//   const counts = {};
//   projects.forEach(p => {
//     counts[p.year] = (counts[p.year] || 0) + 1;
//   });
//   return counts;
// }

// function render(projects) {
//   const yearCounts = countProjectsByYear(projects);
//   const uniqueYears = [...new Set(allProjects.map(p => p.year))];

//   drawPieChart(yearCounts);
//   drawLegend(uniqueYears);
//   renderProjects(projects);
// }

// function drawLegend(years) {
//   legend.innerHTML = '';
//   years.forEach((year, i) => {
//     const li = document.createElement('li');
//     li.innerHTML = `<span class="swatch" style="--color: ${colors[i % colors.length]}"></span> ${year}`;
//     li.onclick = () => toggleYear(year);
//     legend.appendChild(li);
//   });
// }

// function toggleYear(year) {
//   if (currentYear === year) {
//     currentYear = null;
//     const onePerYear = Object.values(groupBy(allProjects, 'year')).map(g => g[0]);
//     render(onePerYear);
//   } else {
//     currentYear = year;
//     render(allProjects.filter(p => p.year === year));
//   }
// }

// function drawPieChart(yearCounts) {
//   const labels = Object.keys(yearCounts);
//   const data = Object.values(yearCounts);
//   const bgColors = labels.map((_, i) => colors[i % colors.length]);

//   if (pieChart) {
//     pieChart.destroy();
//   }

//   pieChart = new Chart(canvas, {
//     type: 'doughnut',
//     data: {
//       labels,
//       datasets: [{
//         data,
//         backgroundColor: bgColors,
//         borderWidth: 1
//       }]
//     },
//     options: {
//       responsive: true,
//       cutout: '30%',
//       rotation: -90,
//       circumference: 360,
//       plugins: {
//         legend: {
//           display: false
//         },
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               const label = context.label || '';
//               const value = context.raw;
//               return `${label}: ${value} project${value > 1 ? 's' : ''}`;
//             }
//           }
//         }
//       }
//     }
//   });
// }

// function renderProjects(projects) {
//   projectsContainer.innerHTML = '';
//   projectsContainer.style.display = 'flex';
//   projectsContainer.style.flexWrap = 'wrap';
//   projectsContainer.style.justifyContent = 'center';
//   projectsContainer.style.gap = '20px';

//   projects.forEach(p => {
//     const div = document.createElement('div');
//     div.className = 'project-square';
//     div.innerHTML = `
//       <div class="project-info">
//         <h3>${p.title} (${p.year})</h3>
//         <img src="${p.image}" alt="${p.title}" width="100%">
//         <p>${p.description}</p>
//       </div>
//     `;
//     projectsContainer.appendChild(div);
//   });
// }
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PIE_RADIUS = 40;
const colors = d3.schemeCategory10;
let selectedYear = null;
let projectData = [];
let yearColorMap = new Map();

const pieChart = d3.select("#projects-pie-chart");
const projectContainer = d3.select(".projects");

// Load JSON data
d3.json("assets/json/project.json").then(data => {
  projectData = data;
  const years = [...new Set(projectData.map(p => p.year))].sort().reverse();
  const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
  const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }));

  // Create consistent color map
  pieData.forEach((d, i) => yearColorMap.set(d.year, colors[i]));

  renderButtons(pieData);
  updateView();
});

// Render year buttons with slice color
function renderButtons(pieData) {
  const container = d3.select(".container");
  const buttonContainer = container.append("div")
    .attr("class", "year-buttons")
    .style("display", "flex")
    .style("gap", "0.5rem")
    .style("margin-bottom", "1rem")
    .style("flex-wrap", "wrap");

  pieData.forEach((d, i) => {
    buttonContainer.append("button")
      .text(d.year)
      .attr("data-year", d.year)
      .style("background-color", colors[i])
      .style("color", "#fff")
      .style("border", "none")
      .style("padding", "0.5rem 1rem")
      .style("border-radius", "5px")
      .style("cursor", "pointer")
      .on("click", function () {
        const year = d.year;
        if (selectedYear === year) {
          selectedYear = null; // Deselect
        } else {
          selectedYear = year;
        }
        updateView();
      });
  });
}

// Update pie chart and project cards
function updateView() {
  const yearCounts = d3.rollup(projectData, v => v.length, d => d.year);
  const pieData = Array.from(yearCounts, ([year, count]) => ({ year, count }));

  drawPieChart(pieData);
  renderProjects();
}

// Draw the pie chart
function drawPieChart(pieData) {
  const arcGen = d3.arc()
    .innerRadius(0)
    .outerRadius(PIE_RADIUS);

  const pieGen = d3.pie()
    .sort(null)
    .value(d => d.count);

  const arcs = pieGen(pieData);

  pieChart.selectAll("*").remove();

  pieChart.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arcGen)
    .attr("fill", d => yearColorMap.get(d.data.year))
    .attr("opacity", d => selectedYear && d.data.year !== selectedYear ? 0.1 : 1)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);
}

function renderProjects() {
  projectContainer.html("");

  let filtered = [];

  if (selectedYear) {
    filtered = projectData.filter(p => p.year === selectedYear);
  } 
  else {
    const byYear = d3.groups(projectData, d => d.year);
    byYear.forEach(([_, projects]) => {
      const latest = projects.sort((a, b) => b.title.localeCompare(a.title))[0];
      filtered.push(latest);
    });
  }

  filtered.forEach(project => {
    // Create anchor wrapper
    const flipCard = projectContainer.append("a")
      .attr("href", project.link)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .attr("class", "flip-card");
  
    const inner = flipCard.append("div").attr("class", "flip-card-inner");
  
    // Front
    const front = inner.append("div").attr("class", "flip-card-front");
    front.append("img")
      .attr("src", project.image)
      .attr("alt", project.title);
  
    // Back
    const back = inner.append("div").attr("class", "flip-card-back");
    back.append("h3").text(project.title);
    back.append("p").text(project.year);
    back.append("p").text(project.description);
  });
}

