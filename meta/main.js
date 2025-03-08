/* meta/main.js */
let data = [];
let commits = [];
let filteredCommits = [];
let brushSelection = null;
let selectedCommits = [];
let xScale, yScale, rScale, timeScale;

async function loadData() {
    console.log("Loading data...");
    data = await d3.csv('loc.csv', (row) => {
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
    });
    
    console.log("Loaded Data:", data);
    
    if (data.length === 0) {
        console.error("Error: No data loaded from loc.csv!");
        return;
    }
    
    processCommits();
    setupScales();
    displayStats();
    createUI();
    updateFilteredCommits();
    createScatterplot();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

function processCommits() {
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        return {
            id: commit,
            url: `https://github.com/PDhruv09/Dhruv_Patel_website/commit/${commit}`,
            author: first.author,
            date: first.date,
            datetime: first.datetime,
            hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
            totalLines: lines.length,
            lines: lines
        };
    });
}

function setupScales() {
    timeScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, 100]);
}

function displayStats() {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').text('Total LOC');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total Commits');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('Number of Files');
    dl.append('dd').text(new Set(data.map(d => d.file)).size);

    dl.append('dt').text('Max File Length');
    dl.append('dd').text(d3.max(data, d => d.length));
}

function createUI() {
    const slider = d3.select("#slider");
    slider.on("input", function() {
        d3.select("#selectedTime").text(new Date(timeScale.invert(this.value)).toLocaleString());
        updateFilteredCommits();
    });
}

function updateFilteredCommits() {
    let commitMaxTime = timeScale.invert(+d3.select("#slider").property("value"));
    filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    updateScatterplot();
    updateFileVisualization();
}

function createScatterplot() {
    if (commits.length === 0) {
        console.error("Error: No commits available for scatterplot!");
        return;
    }
    
    const width = 1000, height = 600;
    const margin = { top: 10, right: 10, bottom: 40, left: 50 };
    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    xScale = d3.scaleTime().domain(d3.extent(commits, d => d.datetime)).range([margin.left, width - margin.right]);
    yScale = d3.scaleLinear().domain([0, 24]).range([height - margin.bottom, margin.top]);
    rScale = d3.scaleSqrt().domain(d3.extent(commits, d => d.totalLines)).range([3, 20]);
    
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${String(d % 24).padStart(2, '0')}:00`));
    
    updateScatterplot();
}

function updateScatterplot() {
    d3.select("svg g.dots").remove();
    
    const svg = d3.select("#chart svg");
    const dots = svg.append("g").attr("class", "dots");
    
    dots.selectAll("circle").data(filteredCommits).enter().append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines))
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7)
        .transition().duration(500)
        .attr("fill-opacity", 1);
}

function updateFileVisualization() {
    let files = d3.groups(filteredCommits.flatMap(d => d.lines), d => d.file)
        .map(([name, lines]) => ({ name, lines }));
    files = d3.sort(files, d => -d.lines.length);
    
    d3.select(".files").selectAll("div").remove();
    let filesContainer = d3.select(".files").selectAll("div").data(files).enter().append("div");
    
    filesContainer.append("dt").html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
    filesContainer.append("dd").selectAll("div").data(d => d.lines).enter().append("div")
        .attr("class", "line")
        .style("background", d => fileTypeColors(d.type));
}
