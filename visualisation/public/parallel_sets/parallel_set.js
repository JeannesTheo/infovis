onload = function () {
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

    const chart = (graph,/*list_genres*/) => {
        const width = 928; // A adapter dynamiquement width = document.getElementById("chart-container").offsetWidth;
        const height = 720; // A adapter dynamiquement height = document.getElementById("chart-container").offsetHeight;

        const sankey = d3.sankey()
            .nodeSort(null)
            .linkSort(null)
            .nodeWidth(4)
            .nodePadding(20)
            .extent([[0, 5], [width, height - 5]]);

        const color = d3.scaleOrdinal(["True"], ["#da4f81"]).unknown("#ccc");

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
//          .filter(d => list_genres.includes(d.genre))
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .append("title")
            .text(d => `${d.name}\n${d.value.toLocaleString()}`);

        svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(links) // .filter(d => list_genres.includes(d.names[0])) Might be a issue
            .join("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.names[0]))
            .attr("stroke-width", d => d.width)
            .style("mix-blend-mode", "multiply")
            .append("title")
            .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

        svg.append("g")
            .style("font", "10px sans-serif")
            .selectAll("text")
            .data(nodes)
        //            .filter(d => list_genres.includes(d.genre))
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name)
            .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => ` ${d.value.toLocaleString()}`);

        return svg.node();
    };

    /**
     * Get all the genres from the data
     * @param data
     * @returns Set of Genres
     */
    function get_genres(data) {
        let genres = new Set();
        data.forEach(i => {
            genres.add(i["genre"]);
        })
        return genres;
    }

    function createChexboxes(data){
        // Get list of genres from data
        let genres = get_genres(data);
        // Get the body element
        const checkboxes = document.getElementById("checkboxes");
        genres.forEach(i => {
            checkboxes.appendChild(createCheckbox(i));
            list_genres.push(i);
        });
    }

    function createCheckbox(txt){
        // Create the checkbox
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = txt;
        checkbox.value = txt;
        checkbox.id = txt;
        checkbox.checked = true;
        // Create the label
        const label = document.createElement('label');
        label.htmlFor = txt;
        label.appendChild(document.createTextNode(txt));
        // Add them to the container div
        const container = document.createElement('div');
        container.appendChild(checkbox);
        container.appendChild(label);
        document.addListener(checkbox, 'click', function(e){
            e.preventDefault();
            e.stopPropagation();
            if (e.target.checked) {
                list_genres.add(e.target.value);
            } else {
                list_genres.delete(e.target.value);
            }
            updateChart(graph,list_genres);
        });
        return container;
    }

function updateChart(graph,list_genres) {
        const chartContainer = d3.select("#chart-container");
        const sankeyData = chart(graph, list_genres);
        // chartContainer.node().removeChild() supprimer tout les enfants
        chartContainer.node().appendChild(sankeyData); // ajouter un enfant
}

// Example usage:
    const csvFilePath = "parallel_set_filtered.csv";
    let list_genres = new Set(); // Set of genres to display, might need to be global
    d3.csv(csvFilePath).then(function (data) {
        createChexboxes(data);
        const chartContainer = d3.select("#chart-container");
        const graphData = graph(data);
        // updateChart(graphData); // To add
        const sankeyData = chart(graphData);  //To remove
        chartContainer.node().appendChild(sankeyData); //To remove
    });
}