/* ==========================================
   META ANALYSIS - ENHANCED VERSION
   ========================================== */

console.log("📊 Meta analysis loading...");

// State
let data = [];
let commits = [];
let filteredCommits = [];
let xScale, yScale, rScale, timeExtent;

// Configuration
const margin = { top: 20, right: 20, bottom: 60, left: 70 };
let width, height;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    showLoadingState();
    calculateDimensions();
    loadData();
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        calculateDimensions();
        if (data.length > 0) {
            createScatterplot();
            updateScatterplot();
        }
    }, 250));
});

// ==========================================
// LOADING STATE
// ==========================================
function showLoadingState() {
    const chart = document.getElementById('chart');
    chart.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading commit data...</p>
        </div>
    `;
}

// ==========================================
// CALCULATE RESPONSIVE DIMENSIONS
// ==========================================
function calculateDimensions() {
    const chartContainer = document.getElementById('chart');
    const containerWidth = chartContainer.clientWidth;
    
    // Responsive sizing
    if (window.innerWidth < 480) {
        width = Math.min(containerWidth, 400) - margin.left - margin.right;
        height = 400 - margin.top - margin.bottom;
    } else if (window.innerWidth < 768) {
        width = Math.min(containerWidth, 600) - margin.left - margin.right;
        height = 450 - margin.top - margin.bottom;
    } else {
        width = Math.min(containerWidth, 1000) - margin.left - margin.right;
        height = 500 - margin.top - margin.bottom;
    }
}

// ==========================================
// LOAD DATA
// ==========================================
async function loadData() {
    try {
        data = await d3.csv('loc.csv', (row) => {
            try {
                return {
                    file: row.file,
                    line: +row.line,
                    type: row.type,
                    commit: row.commit,
                    author: row.author,
                    date: new Date(row.date + 'T00:00:00' + row.timezone),
                    datetime: new Date(row.datetime),
                    depth: +row.depth,
                    length: +row.length
                };
            } catch (error) {
                console.warn('Error parsing row:', row, error);
                return null;
            }
        });

        // Filter out null entries
        data = data.filter(d => d !== null);

        if (data.length === 0) {
            throw new Error("No valid data found in CSV");
        }

        console.log(`✅ Loaded ${data.length} lines of code`);

        processCommits();
        setupScales();
        displayStats();
        setupSlider();
        filterBySlider(); // default full range
        createScatterplot();
        setupBrush();
        
        console.log("✨ Meta analysis ready!");
        
    } catch (error) {
        console.error("❌ Error loading data:", error);
        showErrorState(error.message);
    }
}

// ==========================================
// ERROR STATE
// ==========================================
function showErrorState(message) {
    const chart = document.getElementById('chart');
    chart.innerHTML = `
        <div class="error-message" role="alert" style="text-align: center; padding: 2rem;">
            <p style="font-size: 1.2rem; color: var(--danger-color, #ef4444);">⚠️ Unable to load commit data</p>
            <p style="color: var(--text-secondary); margin-top: 1rem;">${message}</p>
        </div>
    `;
}

// ==========================================
// PROCESS COMMITS
// ==========================================
function processCommits() {
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
        const first = lines[0];
        return {
            id: commit,
            url: `https://github.com/PDhruv09/Dhruv_Patel_website/commit/${commit}`,
            author: first.author,
            date: first.date,
            datetime: first.datetime,
            hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
            totalLines: lines.length,
            lines
        };
    });
}

// ==========================================
// SETUP SCALES
// ==========================================
function setupScales() {
    timeExtent = d3.extent(commits, d => d.datetime);
    
    xScale = d3.scaleTime()
        .domain(timeExtent)
        .range([margin.left, width + margin.left]);
    
    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height, margin.top]);
    
    rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([4, 15]);
}

// ==========================================
// DISPLAY STATS
// ==========================================
function displayStats() {
    const container = d3.select('#stats');
    container.html('');
  
    const stats = [
        { label: 'Total LOC', value: data.length, icon: '📝' },
        { label: 'Total Commits', value: commits.length, icon: '🔄' },
        { label: 'Number of Files', value: new Set(data.map(d => d.file)).size, icon: '📁' },
        { label: 'Max File Length', value: d3.max(data, d => d.length), icon: '📏' }
    ];
  
    stats.forEach((stat, index) => {
        const dd = container.append('dd')
            .attr('data-label', stat.label)
            .style('animation-delay', `${index * 0.1}s`)
            .style('animation', 'fadeInUp 0.5s ease-out backwards');
        
        // Add icon
        dd.append('div')
            .style('font-size', '2rem')
            .style('margin-bottom', '0.5rem')
            .text(stat.icon);
        
        dd.append('div')
            .style('font-size', 'clamp(2rem, 4vw, 3rem)')
            .text(stat.value + (stat.label === 'Total LOC' || stat.label === 'Total Commits' ? '+' : ''));
    });
}

// ==========================================
// SETUP SLIDER
// ==========================================
function setupSlider() {
    const slider = document.getElementById('time-slider');
    slider.min = 0;
    slider.max = 100;
    slider.value = 100;

    slider.addEventListener('input', () => {
        filterBySlider();
    });
}

// ==========================================
// FILTER BY SLIDER
// ==========================================
function filterBySlider() {
    const percent = +document.getElementById('time-slider').value / 100;
    const threshold = new Date(timeExtent[0].getTime() + percent * (timeExtent[1] - timeExtent[0]));
    
    document.getElementById('selected-time').textContent = 
        `Showing commits before: ${threshold.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
    
    filteredCommits = commits.filter(d => d.datetime <= threshold);
    updateScatterplot();
    
    // Announce to screen readers
    announceToScreenReader(`Showing ${filteredCommits.length} commits`);
}

// ==========================================
// CREATE SCATTERPLOT
// ==========================================
function createScatterplot() {
    const chart = d3.select("#chart");
    chart.html('');  // Clear existing

    const svg = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // X-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%b %Y'))
        .ticks(window.innerWidth < 480 ? 3 : 5);
    
    svg.append("g")
        .attr("transform", `translate(0, ${height + margin.top})`)
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => `${String(d % 24).padStart(2, '0')}:00`)
        .ticks(12);
    
    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("class", "y-axis")
        .call(yAxis);

    // Axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height + margin.top + 50})`)
        .style("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .style("font-size", "12px")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -(height / 2 + margin.top))
        .style("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .style("font-size", "12px")
        .text("Time of Day");

    // Dots group
    svg.append("g")
        .attr("class", "dots")
        .attr("transform", `translate(0, ${margin.top})`);
    
    updateScatterplot();
}

// ==========================================
// UPDATE SCATTERPLOT
// ==========================================
function updateScatterplot() {
    const svg = d3.select("#chart svg");
    const dotGroup = svg.select(".dots");

    dotGroup.selectAll("circle").remove();

    const circles = dotGroup.selectAll("circle")
        .data(filteredCommits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", 0)
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.6)
        .style("cursor", "pointer")
        .on("mouseenter touchstart", (event, d) => {
            renderTooltip(d);
            toggleTooltip(true);
            moveTooltip(event);
            
            // Highlight on hover
            d3.select(event.currentTarget)
                .attr("fill", "var(--accent-color)")
                .attr("fill-opacity", 1);
        })
        .on("mousemove touchmove", (event) => {
            moveTooltip(event);
        })
        .on("mouseleave touchend", (event) => {
            toggleTooltip(false);
            
            // Reset style
            d3.select(event.currentTarget)
                .attr("fill", "steelblue")
                .attr("fill-opacity", 0.6);
        });

    // Animate entrance
    circles.transition()
        .duration(500)
        .delay((d, i) => i * 2)
        .attr("r", d => rScale(d.totalLines));
}

// ==========================================
// TOOLTIP FUNCTIONS
// ==========================================
function renderTooltip(d) {
    document.getElementById("commit-link").href = d.url;
    document.getElementById("commit-link").textContent = d.id.substring(0, 8);
    document.getElementById("commit-date").textContent = d.datetime.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById("commit-author").textContent = d.author;
    document.getElementById("commit-lines").textContent = `${d.totalLines} line(s)`;
}

function toggleTooltip(show) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !show;
}

function moveTooltip(event) {
    const tooltip = document.getElementById("commit-tooltip");
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    const y = event.clientY || (event.touches && event.touches[0].clientY);
    
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y + 15}px`;
}

// ==========================================
// SETUP BRUSH
// ==========================================
function setupBrush() {
    const svg = d3.select("#chart svg");

    const brush = d3.brush()
        .extent([[margin.left, margin.top], [width + margin.left, height + margin.top]])
        .on("start brush end", (event) => {
            const selection = event.selection;
            
            if (!selection) {
                d3.selectAll("circle").classed("selected", false);
                updateSelectionUI([]);
                return;
            }

            const [[x0, y0], [x1, y1]] = selection;

            const selected = filteredCommits.filter(d => {
                const x = xScale(d.datetime);
                const y = yScale(d.hourFrac) + margin.top;
                return x0 <= x && x <= x1 && y0 <= y && y <= y1;
            });

            d3.selectAll("circle")
                .classed("selected", d => selected.includes(d));

            updateSelectionUI(selected);
        });

    svg.append("g")
        .attr("class", "brush")
        .call(brush);
}

// ==========================================
// UPDATE SELECTION UI
// ==========================================
function updateSelectionUI(selectedCommits) {
    const countText = selectedCommits.length
        ? `${selectedCommits.length} commit${selectedCommits.length > 1 ? 's' : ''} selected`
        : "No commits selected";
    document.getElementById("selection-count").textContent = countText;
  
    // Flatten lines and compute language breakdown
    const breakdown = d3.rollups(
        selectedCommits.flatMap(d => d.lines),
        v => v.length,
        d => d.type
    );
  
    const container = document.getElementById("language-breakdown");
    container.innerHTML = '';
  
    const totalLines = d3.sum(breakdown, d => d[1]);
    if (totalLines === 0) return;
  
    for (const [lang, count] of breakdown) {
        const pct = Math.round((count / totalLines) * 100);
    
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-circle';
        langDiv.innerHTML = `
            <div class="circle">${pct}%</div>
            <div class="lang-label">${lang.toUpperCase()}</div>
        `;
        container.appendChild(langDiv);
    }
    
    // Announce to screen readers
    announceToScreenReader(`${selectedCommits.length} commits selected, showing language breakdown`);
}

// ==========================================
// SCREEN READER ANNOUNCEMENTS
// ==========================================
function announceToScreenReader(message) {
    let announcer = document.getElementById("meta-announcer");
    
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "meta-announcer";
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
// DEBOUNCE UTILITY
// ==========================================
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

// Add fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
