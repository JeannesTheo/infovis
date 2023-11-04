import {getHeight} from '../utils.js';
import {
    fillSlider, setToggleAccessible, controlFromSlider, controlToSlider, controlFromInput, controlToInput
} from './slider.js';

let barChartHeight = getHeight() * .25;
let deltaYear = 30;
let dataBarChart = []
let centerPointSaved = null
let dataSaved = []
document.querySelector('#barchart').addEventListener('wheel', function (e) {
    if (e.deltaY < 0) {
        deltaYear = Math.max(0, deltaYear - 1)
    } else {
        deltaYear = Math.min(30, deltaYear + 1)
    }
    showBarChart(dataBarChart, centerPointSaved)
})
let startYear;
let endYear;
let realHeight = getHeight() - document.querySelector('header').offsetHeight - barChartHeight * 1.1
let height = realHeight * .97
let margins = realHeight * .03
let width = realHeight
let start = 0
let end = 2.25
let numSpirals = 3
let color = d3.scaleOrdinal().range(// ["#825600", "#707aff", "#b2e800", // "#ec00b7",
    //     "#009039", "#0073e0", "#01d9ab"]);
// ["#ffa6ff", "#877000", "#007de7", "#00cf9b", "#66009f"]);
//     ["#ffc3eb",
//         "#54a94f",
//         "#b878f6",
//         "#afa58a",
//         "#c5f49e",
//         "#2cb9d4"]);
    ["#ff74be", "#01aa2c", "#b772ff", "#cdb739", "#9ff85f", "#00ffff"]);
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
        .style("fill", "black")
        .attr("startOffset", function (d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })
}

function addTooltips(divOrigine, divTooltip) {
    let tooltip = d3.select("#" + divTooltip)
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
    tooltip.append('div')
        .attr('class', 'repartition');

    divOrigine.selectAll("rect")
        .on('mouseover', function (d) {
            let total = dataSaved.filter(e => {
                return e.date === d.date && e.group === d.group
            }).map(e => parseInt(e.value)).reduce((a, b) => a + b, 0)
            let explicitLyrics = d.explicit === 'True' ? "Yes" : "No"
            let textExplicit = d.explicit === 'True' ? "Explicit" : "Implicit"
            tooltip.select('.date').html("Year: <b>" + d.date + "</b>");
            tooltip.select('.value').html("Songs: <b>" + d.value + "<b>");
            tooltip.select('.genre').html("Genre: <b>" + d.group + "<b>");
            tooltip.select('.explicit').html("Explicit Lyrics: <b>" + explicitLyrics + "<b>");
            tooltip.select('.repartition').html(textExplicit + " Proportion: <b> " + Math.round((parseInt(d.value) / total) * 100) + "% (" + d.value + '/' + total + ")<b>");

            d3.select(this)
                .style("fill", "#FFFFFF")
                .style("stroke", "#000000")
                .style("stroke-width", "2px");

            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);

        })
        .on('mousemove', function () {
            if (divTooltip === 'barchart') {
                tooltip.style('top', (d3.event.layerY - 80) + 'px')
                    .style('left', (d3.event.layerX + 25) + 'px');
            } else {
                tooltip.style('top', (d3.event.layerY + 10) + 'px')
                    .style('left', (d3.event.layerX - 25) + 'px');
            }
        })
        .on('mouseout', function () {
            d3.selectAll("rect")
                .style("fill", function (d) {
                    return color(d.date);
                })
                .style("stroke", function (d) {
                    if (d.explicit === 'True') return '#ff0000'; else return 'none';
                })
                .style("stroke-width", function (d) {
                    if (divTooltip === 'barchart') {
                        if (d.explicit === 'True')
                            return '1.25px';
                        else
                            return '0'
                    } else if (d.explicit === 'True')
                        return '.7px';
                    else
                        return '0'
                })
                .style("opacity", function (d) {
                    if (d.explicit === 'True') return .8; else return 1;
                }).style("stroke", function (d) {
                if (d.explicit === 'True') return '#ff0000'; else return 'none';
            })

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
    // yScale for the bar height
    let yScale = d3.scaleLog()
        .clamp(true)
        .domain([1, maximumCount]) // quand on fait pas confiance a d3js ca marche mieux :p
        .range([0, (r / (numSpirals + 1)) - 10]);
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
            return color(d.date);
        }).style("stroke", function (d) {
        if (d.explicit === 'True') return '#ff0000'; else return 'none';
    })
        .style("stroke-width", ".7px")
        .attr("transform", function (d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        }).on('click', function (d) {
        showBarChart(someData, d)
    })
    return barWidth
}

function showBarChart(someData, centerPoint = null) {
    if (someData.length === 0) {
        someData = dataBarChart
        centerPoint = centerPointSaved
    }
    if (centerPoint === null) {
        centerPoint = someData[Math.floor(someData.length / 2)]
        centerPointSaved = centerPoint
    }

    centerPointSaved = centerPoint
    someData = someData.filter(d => d.date <= parseInt(centerPoint.date) + deltaYear && d.date >= centerPoint.date - deltaYear)
    let barChart = document.querySelector('#barchart')
    barChart.innerHTML = ''
    let icon = document.createElement('img')
    icon.src = 'spiral.png'
    icon.id = 'scroll'
    barChart.appendChild(icon)
    let height = barChartHeight * .83
    let svgBarChart = d3.select("#barchart").append("svg")
        .attr("width", barChart.clientWidth)
        .attr("height", barChartHeight)
        .append("g")
    let length = someData.length
    let coeff = length > 900 ? 1.5 : length > 500 ? 2 : length > 200 ? 3 : 5
    let barWidth = (barChart.offsetWidth / (length * coeff));
    let genres_map = getIndexGenres(someData);
    let domainSpiral = d3.extent(someData, function (d) {
        return parseInt(d.date) + genres_map[d.group];
    })
    let xScale = d3.scaleLinear()
        .domain(domainSpiral)
        .range([0, barChart.clientWidth])
    let maximumCount = 0
    someData.map(d => d.value).forEach(d => maximumCount = Math.max(maximumCount, d))
    // yScale for the bar height
    let yScale = d3.scaleLog()
        .clamp(true)
        .domain([1, maximumCount]) // quand on fait pas confiance a d3js ca marche mieux :p
        .range([height, 0]);
    svgBarChart.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xScale(parseInt(d.date) + genres_map[d.group])
        })
        .attr("y", function (d) {
            return yScale(d.value)
        })
        .attr("width", function () {
            return barWidth;
        })
        .attr("height", function (d) {
            return (height - yScale(d.value));
        })
        .style("fill", function (d) {
            return color(d.date);
        }).style("stroke", function (d) {
        if (d.explicit === 'True') return '#ff0000'; else return 'none';
    }).style("stroke-width", "1.25px")
        .style("opacity", function (d) {
            if (d.explicit === 'True') return .8; else return 1;
        })
        .on('click', function (d) {
            showBarChart(someData, d)
        })

    addTooltips(svgBarChart, 'barchart')

    const xAxis = d3.scaleBand()
        .domain(someData.map(d => d.date).sort())
        .range([0, barChart.clientWidth])

    svgBarChart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xAxis))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font", "10px arial")

}

window.onload = function () {
    let genresDisplayed

    function displayData(data, genres, startYear, endYear, explicit, implicit) {
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
        showBarChart(someData)
        dataBarChart = someData
        setBars(someData);
        addLabels(someData);
        addTooltips(svg, 'chart');
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

    document.querySelector('#barchart').style.height = barChartHeight + 'px'
    d3.csv('spiral_plot_count.csv').then(function (data) {
        document.querySelector('#filters').style.height = getHeight() * .85 + 'px'
        createGenresFilters(getListGenres(data))
        dataSaved = data.map(d => ({'date': d.year, 'group': d.genre, 'value': d.count}))
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
    }).catch(function () {
        alert("Le fichier spiral_plot_count.csv n'a pas été trouvé. Veuillez le placer dans le dossier spiral_plot puis réessayer.")
    });
}

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

