window.onload = function () {
    function createCheckboxes(genres) {
        const genreDropdown = document.getElementById('genre-dropdown');

        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.text = genre;
            genreDropdown.appendChild(option);
        });

        genreDropdown.addEventListener('click', updateChart);
    }

    const genres = ["Alternative", "Baroque", "Blues", "Country", "Dance", "Disco", "Electro", "Folk", "Funk", "Gospel", "Hip-hop", "House", "Jazz", "Metal", "Other", "Pop", "Punk", "R&B", "Reggae", "Rock", "Souls", "Undefined"]
    const csvFilePath = "filled_parallel_set.csv";
    d3.csv(csvFilePath).then(function (data) {
        createCheckboxes(genres);
        const chartContainer = d3.select("#chart-container");
        const graphData = graph(data);
        const sankeyData = chart(graphData, genres);
        chartContainer.node().appendChild(sankeyData);
    });


    // const c = document.getElementById("chart-container");
    // c.addEventListener('click', function() {
    //     console.log("click");
    //     tmp = d3.select(this);
    //     tmp.attr('fill', 'red');
    //     console.log(tmp);
    // });
    addPathsListeners()
}

function addPathsListeners() {
    Array.from(document.getElementsByTagName("svg")).forEach(function(path){
        path.addEventListener('click', function (e) {
                console.log("path click");
                console.log(e);
            }
        )
    })
}

const graph = (data) => {
    console.log(data)
    const keys = data.columns.slice(0, -1);
    let index = -1;
    const nodes = [];
    const nodeByKey = new Map();
    const indexByKey = new Map();
    const links = [];

    for (const k of keys) {
        for (const d of data) {
            const key = [k, d[k]];
            if (!nodeByKey.has(JSON.stringify(key))) {
                const node = {name: d[k]};
                nodes.push(node);
                nodeByKey.set(JSON.stringify(key), node);
                indexByKey.set(JSON.stringify(key), ++index);
            }
        }
    }

    for (let i = 1; i < keys.length; ++i) {
        const a = keys[i - 1];
        const b = keys[i];
        const prefix = keys.slice(0, i + 1);
        const linkByKey = new Map();
        for (const d of data) {
            const names = prefix.map(k => d[k]);
            const value = d.value || 1;
            if (linkByKey.has(JSON.stringify(names))) {
                linkByKey.get(JSON.stringify(names)).value += value;
            } else {
                const link = {
                    source: indexByKey.get(JSON.stringify([a, d[a]])),
                    target: indexByKey.get(JSON.stringify([b, d[b]])),
                    names: names,
                    value: value,
                };
                links.push(link);
                linkByKey.set(JSON.stringify(names), link);
            }
        }
    }

    return {nodes, links};
};

const chart = (graph, list_genres) => {
    const width = 1200; // A adapter dynamiquement width = document.getElementById("chart-container").offsetWidth;
    const height = 720; // A adapter dynamiquement height = document.getElementById("chart-container").offsetHeight;

    const sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[0, 5], [width, height - 5]]);

    const color = d3.scaleOrdinal(["True"], ["#f34343"]).unknown("#93e0d8");

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");


    const {nodes, links} = sankey({
        nodes: graph.nodes.map(d => Object.create(d)),
        links: graph.links.map(d => Object.create(d))
    });

    svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .append("title")
        .text(d => `Y ${d.name}\n${d.value.toLocaleString()}`);

    svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => color(d.names[0]))
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply")
        .append("title")
        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`)

    svg.append("g")
        .style("font", "1em sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.5em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);

    // append un autre g pour le on click details?

    return svg.node();
};

function updateChart() {
    const csvFilePath = "filled_parallel_set.csv";
    d3.csv(csvFilePath).then(function (data) {
        console.log("updateChart");
        const genreDropdown = document.getElementById('genre-dropdown');
        const selectedGenres = Array.from(genreDropdown.selectedOptions).map(option => option.value);
        console.log(selectedGenres);
        const filtered = data.filter(function(d)
        {
            if (selectedGenres.includes(d["genre"])) {
                return d;
            }
        });
        filtered.columns = data.columns;
        console.log(typeof data,typeof filtered);
        const chartContainer = d3.select("#chart-container");
        const upGraphData = graph(filtered);
        const upSankeyData = chart(upGraphData, selectedGenres);
        //remove child
        chartContainer.node().removeChild(chartContainer.node().lastChild);
        chartContainer.node().appendChild(upSankeyData);
    });
}