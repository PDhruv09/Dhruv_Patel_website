/* meta/main.js */
let data = [];
let commits = [];
let filteredCommits = [];
let xScale, yScale, rScale, timeExtent;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        file: row.file,
        line: +row.line,
        type: row.type,
        commit: row.commit,
        author: row.author,
        date: new Date(row.date + 'T00:00:00' + row.timezone),
        datetime: new Date(row.datetime),
        depth: +row.depth,
        length: +row.length
    }));

    if (data.length === 0) {
        console.error("CSV is empty!");
        return;
    }

    processCommits();
    setupScales();
    displayStats();
    setupSlider();
    filterBySlider(); // default full range
    createScatterplot();
    setupBrush();
}

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

function setupScales() {
    timeExtent = d3.extent(commits, d => d.datetime);
    xScale = d3.scaleTime().domain(timeExtent);
    yScale = d3.scaleLinear().domain([0, 24]);
    rScale = d3.scaleSqrt().domain(d3.extent(commits, d => d.totalLines)).range([3, 20]);
}

function displayStats() {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats')
        .append('dt').text('Total LOC')
        .append('dd').text(data.length)
        .append('dt').text('Total Commits')
        .append('dd').text(commits.length)
        .append('dt').text('Number of Files')
        .append('dd').text(new Set(data.map(d => d.file)).size)
        .append('dt').text('Max File Length')
        .append('dd').text(d3.max(data, d => d.length));
}

function setupSlider() {
    const slider = document.getElementById('time-slider');
    slider.min = 0;
    slider.max = 100;
    slider.value = 100;

    slider.addEventListener('input', () => {
        filterBySlider();
    });
}

function filterBySlider() {
    const percent = +document.getElementById('time-slider').value / 100;
    const threshold = new Date(timeExtent[0].getTime() + percent * (timeExtent[1] - timeExtent[0]));
    document.getElementById('selected-time').textContent = `Showing commits before: ${threshold.toLocaleDateString()}`;
    filteredCommits = commits.filter(d => d.datetime <= threshold);
    updateScatterplot();
}

function createScatterplot() {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 40, left: 60 };

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    xScale.range([margin.left, width - margin.right]);
    yScale.range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%a %d')));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${String(d % 24).padStart(2, '0')}:00`));

    svg.append("g").attr("class", "dots");
    updateScatterplot();
}

function updateScatterplot() {
    const svg = d3.select("#chart svg");
    const dotGroup = svg.select(".dots");

    dotGroup.selectAll("circle").remove();

    dotGroup.selectAll("circle")
        .data(filteredCommits)
        .join("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines))
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7)
        .on("mouseenter", (event, d) => {
        renderTooltip(d);
        toggleTooltip(true);
        moveTooltip(event);
        })
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseleave", () => toggleTooltip(false));
}

function renderTooltip(d) {
    document.getElementById("commit-link").href = d.url;
    document.getElementById("commit-link").textContent = d.id;
    document.getElementById("commit-date").textContent = d.datetime.toLocaleString();
    document.getElementById("commit-author").textContent = d.author;
    document.getElementById("commit-lines").textContent = `${d.totalLines} line(s)`;
}

function toggleTooltip(show) {
    document.getElementById("commit-tooltip").hidden = !show;
}

function moveTooltip(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;
}

function setupBrush() {
    const svg = d3.select("#chart svg");

    const brush = d3.brush()
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
            const y = yScale(d.hourFrac);
            return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        });

        d3.selectAll("circle")
            .classed("selected", d => selected.includes(d));

        updateSelectionUI(selected);
        });

    svg.append("g").call(brush);
}

function updateSelectionUI(selectedCommits) {
    const countText = selectedCommits.length
        ? `${selectedCommits.length} commit${selectedCommits.length > 1 ? 's' : ''} selected`
        : "No commits selected";
    document.getElementById("selection-count").textContent = countText;

    const breakdown = d3.rollups(
        selectedCommits.flatMap(d => d.lines),
        v => v.length,
        d => d.type
    );

    const container = document.getElementById("language-breakdown");
    container.innerHTML = '';

    const totalLines = d3.sum(breakdown, d => d[1]);

    for (const [lang, count] of breakdown) {
        const pct = d3.format(".1~%")(count / totalLines);
        container.innerHTML += `
        <dt>${lang}</dt>
        <dd>${count} lines (${pct})</dd>
        `;
    }
}