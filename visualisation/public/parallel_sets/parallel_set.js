import {lightenDarkenColor,getWidth,getHeight} from '../utils.js';
function updateOnClick(e, path, total) {
    e.target.style.stroke = "#acd75a";
    path.setAttribute("stroke", "#acd75a");
    let d = document.getElementById("details");
    const number = e.target.textContent.replace(/\D/g, "");
    const text = e.target.textContent.replace(/\d+/g, "");
    let isDragging = false;
    let offsetX, offsetY;
    let stat = parseInt(number, 10) / total * 100;
    d.textContent = text + " represents " + stat.toFixed(2) + "% of the total.";
    d.style.display = "flex";
    d.style.position = "absolute";
    d.style.left = e.clientX + 10 + 'px';
    d.style.top = e.clientY + 10 + 'px';
    d.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - d.offsetLeft;
        offsetY = e.clientY - d.offsetTop;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            d.style.left = e.clientX - offsetX + 'px';
            d.style.top = e.clientY - offsetY + 'px';
        }
    });
}

function resetOnClick() {
    backOnClick()
    Array.from(document.getElementsByTagName('path')).forEach(function (evt) {
        evt.style.stroke =  lightenDarkenColor(evt.getAttribute("stroke"), 90);
    });
}

function backOnClick() {
    Array.from(document.getElementsByTagName('path')).forEach(function (evt) {
        if (evt.textContent.includes("True")) {
            evt.setAttribute("stroke", "#f34343");
            evt.style.stroke = "#f34343";
        } else {
            evt.setAttribute("stroke", "#93e0d8");
            evt.style.stroke = "#93e0d8";
        }
        let d = document.getElementById("details");
        d.textContent = "";
        d.style.display = "none";
    });
}

window.onload = function () {
    function createCheckboxes(genres) {
        const genreSelector  = document.getElementById('genre-selector');

        genres.forEach(genre => {
            // Créez un élément div avec la classe "form-element"
            const formElement = document.createElement("div");
            formElement.classList.add("form-element");

            // Créez un élément input de type checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = genre;
            checkbox.id = genre.toLowerCase();

            // Créez un élément label avec la classe "title" et le texte du genre
            const label = document.createElement("label");
            label.htmlFor = genre.toLowerCase();
            label.classList.add("title");
            label.textContent = genre;

            // Ajoutez l'input et le label à l'élément div "form-element"
            formElement.appendChild(checkbox);
            formElement.appendChild(label);

            // Ajoutez l'élément "form-element" au conteneur "genre-selector"
            genreSelector.appendChild(formElement);
        });

        document.getElementById('filter-button').addEventListener('click', updateChart);
    }

    const genres = ["Alternative", "Baroque", "Blues", "Country", "Dance", "Disco", "Electro", "Folk", "Funk", "Gospel", "Hip-hop", "House", "Jazz", "Metal", "Other", "Pop", "Punk", "R&B", "Reggae", "Rock", "Souls", "Undefined"]
    createCheckboxes(genres);
    updateChart(false);
};

const graph = (data) => {
    const keys = data.columns;
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

const chart = (graph) => {
    const width = getWidth();
    const height = getHeight();
    console.log(width,'*',height);
    const sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[0, 0], [width, height-20]]);

    const color = d3.scaleOrdinal(["True"], ["#f34343"]).unknown("#93e0d8");

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        // .attr("viewBox", [width*.1, 0, width*.8, height*.7])
        .attr("width", width)
        .attr("style", "max-width: 86%; height: auto; margin-top: 2em;");


    const {nodes, links} = sankey({
        nodes: graph.nodes.map(d => Object.create(d)), links: graph.links.map(d => Object.create(d))
    });
    // Carré / Barre noire
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

    //hover tooltip
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
        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

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

    document.getElementById("loading").style.display = "none";
    document.getElementById("general-container").style.visibility = "visible";
    return svg.node();
}


function updateChart(remove = true) {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("general-container").style.visibility = "hidden";

    const csvFilePath = "filled_parallel_set.csv";
    d3.csv(csvFilePath).then(function (data) {
        const genreSelector = document.getElementById('genre-selector');
        const selectedGenres = Array.from(genreSelector.querySelectorAll('input[type="checkbox"]:checked')).map(function (checkbox) { return checkbox.value; });
        const chartContainer = d3.select("#chart-container");
        let upGraphData;
        let numRows;
        if (selectedGenres.length) {
            let filtered = data.filter(function (d) {
                if (selectedGenres.includes(d["genre"])) {
                    return d;
                }
            });
            filtered.columns = data.columns;
            upGraphData = graph(filtered);
            numRows = filtered.length;
        } else {
            upGraphData = graph(data);
            numRows = data.length;
        }
        const upSankeyData = chart(upGraphData);
        //remove child
        if (remove) {
            chartContainer.node().removeChild(chartContainer.node().lastChild);
        }
        chartContainer.node().appendChild(upSankeyData);

        Array.from(chartContainer.node().firstChild.getElementsByTagName('path')).forEach(function (path) {
            path.addEventListener('click', function (e) {
                if (path.getAttribute("stroke") !== "#acd75a") {
                    resetOnClick()
                    //passer le total en param
                    updateOnClick(e, path, numRows)
                } else {
                    backOnClick()
                }
            });
        });
    });
}