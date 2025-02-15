/* meta/main.js */
let data = [];

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
            author: first.author,
            datetime: first.datetime,
            hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
            totalLines: lines.length
        };
    });
}

function displayStats() {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    dl.append('dt').text('Total LOC');
    dl.append('dd').text(data.length);
    dl.append('dt').text('Total Commits');
    dl.append('dd').text(commits.length);
}

function createScatterplot() {
    const width = 1000, height = 600;
    const svg = d3.select('#chart').append('svg').attr('viewBox', `0 0 ${width} ${height}`).style('overflow', 'visible');
    const xScale = d3.scaleTime().domain(d3.extent(commits, d => d.datetime)).range([0, width]).nice();
    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    svg.append('g').selectAll('circle').data(commits).join('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
        })
        .on('mouseleave', () => updateTooltipVisibility(false));
}

function updateTooltipContent(commit) {
    document.getElementById('commit-link').href = commit.url;
    document.getElementById('commit-link').textContent = commit.id;
    document.getElementById('commit-date').textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
}

function updateTooltipVisibility(isVisible) {
    document.getElementById('commit-tooltip').hidden = !isVisible;
}
