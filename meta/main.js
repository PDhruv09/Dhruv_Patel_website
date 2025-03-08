/* meta/main.js */
let data = [];
let commits = [];
let brushSelection = null;

async function loadData() {
    data = await d3.csv('meta/loc.csv', (row) => ({
        ...row,
        line: +row.line,
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime)
    }));

    processCommits();
    displayStats();
    createScatterplot();
}

document.addEventListener('DOMContentLoaded', loadData);

function processCommits() {
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        return {
            id: commit,
            url: `https://github.com/YOUR_REPO/commit/${commit}`,
            author: first.author,
            date: first.date,
            datetime: first.datetime,
            hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
            totalLines: lines.length,
            file: first.file
        };
    });
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

    dl.append('dt').text('Average File Length');
    dl.append('dd').text(d3.mean(data, d => d.length).toFixed(2));
}

function createScatterplot() {
    const width = 1000, height = 600;
    const margin = { top: 10, right: 10, bottom: 40, left: 50 };
    const svg = d3.select('#chart').append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height - margin.bottom, margin.top]);

    const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${String(d % 24).padStart(2, '0')}:00`));

    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .attr('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            d3.select(event.currentTarget).attr('fill-opacity', 1);
        })
        .on('mouseleave', function () {
            updateTooltipVisibility(false);
            d3.select(this).attr('fill-opacity', 0.7);
        });

    setupBrushing(svg, xScale, yScale);
}

function setupBrushing(svg, xScale, yScale) {
    const brush = d3.brush().on('brush end', brushed);
    svg.append('g').call(brush);

    function brushed(event) {
        brushSelection = event.selection;
        updateSelection();
    }
}

function isCommitSelected(commit) {
    if (!brushSelection) return false;
    const [[x0, y0], [x1, y1]] = brushSelection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

function updateSelection() {
    d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
    updateSelectionCount();
    updateLanguageBreakdown();
}

function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById('selection-count').textContent = `${selectedCommits.length || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');
    container.innerHTML = '';

    if (selectedCommits.length === 0) return;

    const lines = selectedCommits.flatMap(d => d.lines);
    const breakdown = d3.rollup(lines, v => v.length, d => d.type);

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);
        container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
    }
}

function updateTooltipContent(commit) {
    document.getElementById('commit-link').href = commit.url;
    document.getElementById('commit-link').textContent = commit.id;
    document.getElementById('commit-date').textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
}

function updateTooltipVisibility(isVisible) {
    document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}
