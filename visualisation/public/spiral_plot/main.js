let width = 800, height = 800, start = 0, end = 2.25, numSpirals = 3
let margin = {top: 50, bottom: 50, left: 50, right: 50};

let theta = function (r) {
    return numSpirals * Math.PI * r;
};

// used to assign nodes color by group
let color = d3.scaleOrdinal(d3.schemeDark2);

let r = d3.min([width, height]) / 2 - 40;

let radius = d3.scaleLinear()
    .domain([start, end])
    .range([40, r]);

let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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

let spiralLength = path.node().getTotalLength(), N = 365, barWidth = (spiralLength / N) - 1;

function getIndexGenres(someData) {
    let tmp = new Set()
    someData.forEach(d => tmp.add(d.group))
    console.log(tmp)
    let genres_map = {}
    let incr = 1/(tmp.size+1)
    let i = incr
    tmp.forEach(d => {
        genres_map[d] = i
        i+=incr
    })
    return genres_map
}

d3.csv('spiral_plot_count.csv').then(function (data) {
    let someData = [];
    data.forEach(function (d) {
            // TODO Add filters for genre, time period, explicit or not
            someData.push({
                date: d.year,
                value: d.count,
                group: d.genre
            });
        // }
    })
    let genres_map = getIndexGenres(someData);
    let res  = d3.extent(someData, function (d) {
        return parseInt(d.date)+genres_map[d.group];
    })
    console.log(genres_map)
    let timeScale = d3.scaleLinear() // Initially, it was year + month, so it worked fine. Now, it's only year, so it's not working by scaling Time
        .domain(res)
        .range([0, spiralLength]);

    // yScale for the bar height
    let yScale = d3.scaleLog()
        .clamp(true)
        .domain([1, d3.max(someData, function (d) {
            return d.value;
        })])
        .range([0, (r / numSpirals) - 30]);

    svg.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            let linePer = timeScale(parseInt(d.date) + genres_map[d.group]); // i * barWidth
            console.log(res)
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
        })
        .style("stroke", "none")
        .attr("transform", function (d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        });

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
        .filter(function(d){
            if (!yearsDisplayed[d.date]){
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


    let tooltip = d3.select("#chart")
        .append('div')
        .attr('class', 'tooltip');

    tooltip.append('div')
        .attr('class', 'date');
    tooltip.append('div')
        .attr('class', 'value');
    tooltip.append('div')
        .attr('class', 'genre');

    svg.selectAll("rect")
        .on('mouseover', function (d) {
            tooltip.select('.date').html("Date: <b>" + d.date + "</b>");
            tooltip.select('.value').html("Value: <b>" + Math.round(d.value * 100) / 100 + "<b>");
            tooltip.select('.genre').html("Genre: <b>" + d.group + "<b>");

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
                .style("stroke", "none")

            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });
});