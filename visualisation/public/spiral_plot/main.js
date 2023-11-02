import {getHeight} from '../utils.js';

function getIndexGenres(someData) {
    let tmp = new Set()
    someData.forEach(d => tmp.add(d.group))
    let genres_map = {}
    let incr = 1 / (tmp.size + 1)
    let i = incr
    tmp.forEach(d => {
        genres_map[d] = i
        i += incr
    })
    return genres_map
}

function getListGenres(someData) {
    let res = new Set()
    someData.forEach(d => res.add(d.genre))
    return res
}

function addLabels(someData) {
    // add date labels
    let yearsDisplayed = new Set();

    svg.selectAll("text")
        .data(someData)
        .enter()
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        .filter(function (d) {
            if (!yearsDisplayed[d.date]) {
                yearsDisplayed[d.date] = 1;
                return true;
            }
            return false;
        })
        .text(d => d.date)
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })
}

function addTooltips() {
    let tooltip = d3.select("#chart")
        .append('div')
        .attr('class', 'tooltip');

    tooltip.append('div')
        .attr('class', 'date');
    tooltip.append('div')
        .attr('class', 'value');
    tooltip.append('div')
        .attr('class', 'genre');
    tooltip.append('div')
        .attr('class', 'explicit');

    svg.selectAll("rect")
        .on('mouseover', function (d) {
            console.log(d)
            let explicitLyrics = d.explicit === 'True' ? "Yes" : "No"
            tooltip.select('.date').html("Date: <b>" + d.date + "</b>");
            tooltip.select('.value').html("Songs: <b>" + Math.round(d.value * 100) / 100 + "<b>");
            tooltip.select('.genre').html("Genre: <b>" + d.group + "<b>");
            tooltip.select('.explicit').html("Explicit Lyrics: <b>" + explicitLyrics + "<b>");

            d3.select(this)
                .style("fill", "#FFFFFF")
                .style("stroke", "#000000")
                .style("stroke-width", "2px");

            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);

        })
        .on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
        })
        .on('mouseout', function (d) {
            d3.selectAll("rect")
                .style("fill", function (d) {
                    return color(d.date);
                })
                .style("stroke", function (d) {
                    if (d.explicit === 'True') return '#ff0000'; else return 'none';
                })
                .style("stroke-width", ".8px");

            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });
}

function setBars(someData) {
    let length = someData.length
    let coeff = length > 900 ? 1.5 : length > 500 ? 2 : length > 200 ? 3 : 5
    let barWidth = (spiralLength / (length * coeff)) - 1;
    let genres_map = getIndexGenres(someData);
    let domainSpiral = d3.extent(someData, function (d) {
        return parseInt(d.date) + genres_map[d.group];
    })
    let timeScale = d3.scaleLinear()
        .domain(domainSpiral)
        .range([0, spiralLength]);
    let maximumCount = 0
    someData.map(d => d.value).forEach(d => maximumCount = Math.max(maximumCount, d))
    console.log(maximumCount)
    // yScale for the bar height
    let yScale = d3.scaleLog()
        .clamp(true)
        .domain([1, maximumCount])
        .range([0, (r / (numSpirals + 1)) - 10]); // Sert a fit la hauteur des barres, pas vraiment de règle ?
    console.log(r, numSpirals)
    svg.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            let linePer = timeScale(parseInt(d.date) + genres_map[d.group]); // i * barWidth
            let posOnLine = path.node().getPointAtLength(linePer)
            let angleOnLine = path.node().getPointAtLength(linePer - barWidth)

            d.linePer = linePer; // % distance are on the spiral
            d.x = posOnLine.x; // x postion on the spiral
            d.y = posOnLine.y; // y position on the spiral

            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", barWidth)
        .attr("height", function (d) {
            return yScale(d.value);
        })
        .style("fill", function (d) {
            // if (d.explicit === 'True') {
            //     return '#ff0000'
            // }else
            return color(d.date);
        }).style("stroke", function (d) {
            if (d.explicit === 'True') return '#ff0000'; else return 'none';
         })
        .style("stroke-width", ".8px")
        .attr("transform", function (d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        });
}

let realHeight = getHeight() - document.querySelector('header').offsetHeight
let height = realHeight * .90
let margins = realHeight * .08
let width = realHeight
let start = 0
let end = 2.25
let numSpirals = 3
let color = d3.scaleOrdinal(d3.schemeCategory10);
let theta = function (r) {
    return numSpirals * Math.PI * r;
};
let distanceFromCenter = 40
let r = d3.min([width, height]) / 2 - distanceFromCenter;

let radius = d3.scaleLinear()
    .domain([start, end])
    .range([distanceFromCenter, r]);

let svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height + margins)
    .append("g")
    .attr("transform", "translate(" + width / 2 + ',' + ((height / 2) + margins) + ")");

let points = d3.range(start, end + 0.001, (end - start) / 1000);

let spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

let path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");
let spiralLength = path.node().getTotalLength()
window.onload = function () {
    let genresDisplayed

    function displayData(data, genres, startYear, endYear, explicit, implicit) {
        // switchLoader()
        svg.selectAll("rect").remove()
        svg.selectAll("text").remove()
        svg.selectAll("tooltip").remove()
        let someData = [];
        data.forEach(function (d) {
            if (genres.has(d.genre) && d.year >= startYear && d.year <= endYear && ((d.explicitLyrics === "True" && explicit) || (d.explicitLyrics === "False" && implicit))) {
                someData.push({
                    date: d.year, value: d.count, group: d.genre, explicit: d.explicitLyrics
                });
            }
        })
        setBars(someData);
        addLabels(someData);
        addTooltips();
        switchLoader()
    }

    function createGenresFilters(listGenres) {
        let genres = listGenres
        genresDisplayed = new Set(genres)
        let select = document.getElementById("genres");
        genres.forEach(d => {
            let butGenre = document.createElement("button");
            butGenre.classList.add("options", "enabled")
            butGenre.textContent = d;
            select.appendChild(butGenre);
            butGenre.addEventListener("click", function (e) {
                e.preventDefault()
                if (butGenre.classList.contains('enabled')) {
                    butGenre.classList.remove('enabled')
                    butGenre.classList.add('disabled')
                    genresDisplayed.delete(butGenre.textContent)
                } else {
                    butGenre.classList.remove('disabled')
                    butGenre.classList.add('enabled')
                    genresDisplayed.add(butGenre.textContent)
                }
            })
        })
    }

    d3.csv('spiral_plot_count.csv').then(function (data) {
        document.querySelector('#filters').style.height = getHeight() * .85 + 'px'
        createGenresFilters(getListGenres(data))
        document.querySelector('#explicitCheckbox')
        document.querySelector('#implicitCheckbox')
        document.querySelector('#validateButton').addEventListener('click', function (e) {
            e.preventDefault()
            switchLoader()
            setTimeout(function () {
                startYear = parseInt(document.querySelector('#fromInput').value)
                endYear = parseInt(document.querySelector('#toInput').value)
                let explicit = document.querySelector('#explicitCheckbox').checked
                let implicit = document.querySelector('#implicitCheckbox').checked
                displayData(data, genresDisplayed, startYear, endYear, explicit, implicit)
            }, 10)
        });
        displayData(data, genresDisplayed, 0, 2023, true, true);
    });
}
let startYear;
let endYear;

function switchLoader() {
    let loader = document.querySelector('.loader')
    let chart = document.querySelector('#chart')
    if (loader.style.display === 'none') {
        loader.style.display = 'block'
        chart.style.display = 'none'
    } else {
        loader.style.display = 'none'
        chart.style.display = 'block'
    }
}


function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#61A3BA', controlSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromSlider.value = from;
    }
}

function controlToInput(toSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#61A3BA', controlSlider);
    setToggleAccessible(toInput);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
    }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#61A3BA', toSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromInput.value = from;
    }
}

function controlToSlider(fromSlider, toSlider, toInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#61A3BA', toSlider);
    setToggleAccessible(toSlider);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
        toSlider.value = from;
    }
}

function getParsed(currentFrom, currentTo) {
    const from = parseInt(currentFrom.value, 10);
    const to = parseInt(currentTo.value, 10);
    return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
    const toSlider = document.querySelector('#toSlider');
    if (Number(currentTarget.value) <= 0) {
        toSlider.style.zIndex = 2;
    } else {
        toSlider.style.zIndex = 0;
    }
}

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromInput = document.querySelector('#fromInput');
const toInput = document.querySelector('#toInput');
fillSlider(fromSlider, toSlider, '#C6C6C6', '#61A3BA', toSlider);
setToggleAccessible(toSlider);

fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);

