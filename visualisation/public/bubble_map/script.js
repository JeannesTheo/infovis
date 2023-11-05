let width = 950,
    height = 900,
    svg = d3.select("#my_dataviz").attr("width", width).attr("height", height);

// Tooltip
const countryName1 = document.querySelector('#countryName1');
const volumeOfSongs1 = document.querySelector('#volumeOfSongs1');
const volumeOfExplicitSongs1 = document.querySelector('#volumeOfExplicitSongs1');
const volumeOfNonExplicitSongs1 = document.querySelector('#volumeOfNonExplicitSongs1');
const percentExplicitSongs1 = document.querySelector('#percentExplicitSongs1');

const countryName2 = document.querySelector('#countryName2');
const volumeOfSongs2 = document.querySelector('#volumeOfSongs2');
const volumeOfExplicitSongs2 = document.querySelector('#volumeOfExplicitSongs2');
const volumeOfNonExplicitSongs2 = document.querySelector('#volumeOfNonExplicitSongs2');
const percentExplicitSongs2 = document.querySelector('#percentExplicitSongs2');4

function transformValue(value) {
    const length = value.toString().length; // Get the length of the original value
    const firstDigit = value.toString()[0]; // Get the first digit as a string
    return parseInt(firstDigit + '0'.repeat(length - 1), 10); // Combine the first digit with zeros;
}

// Example usage:
const originalValue = 309520;
const transformedValue = transformValue(originalValue);
console.log(transformedValue); // Output: 300000



let projection = d3
    .geoMercator()
    .scale(1020) // adjusted from 200
    .translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

const colorScale = d3.scaleSequential(d3.interpolateWarm)
    .domain([5, 0]);

function loadData(removeUS, selectedDecade) {

    // Now, you can use the 'name' variable as needed in your data loading process
    name = "decade_" + selectedDecade + ".csv";
    console.log(name);
// Load external data
    Promise.all([
        // change which json is loaded (filters)

        d3.json("countries.geojson"),
        d3.csv(name),
    ]).then((files) => {
        let geojson = files[0];
        let data = files[1];
        if(removeUS){
            data = data.filter(item => item.country !== "US");
        }
        data.sort(function (a, b) {
          return parseInt(b.TotalVolume) - parseInt(a.TotalVolume);
        })

        const maxTotalValue = d3.max(data, (d) => +d.TotalVolume);
        const TransformedMax = transformValue(maxTotalValue)

        // You can access the instance with the highest TotalValue in the `maxTotalValueInstance` variable.
        console.log("Instance with highest TotalValue:", maxTotalValue);


        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            countryName1.innerHTML = "Country Name: <b>" + d.name + "</b>";
            volumeOfSongs1.innerHTML = "Volume of songs: <b>" + d.TotalVolume + "</b>";
            volumeOfExplicitSongs1.innerHTML = "Volume of explicit songs: <b>" + d.ExplicitVolume + "</b>";
            volumeOfNonExplicitSongs1.innerHTML = "Volume of non-explicit songs: <b>" + d.NonExplicitVolume + "</b>";
            percentExplicitSongs1.innerHTML = "% of explicit songs: <b>" + parseFloat(d.Ratio).toFixed(2) + "%" + "</b>";
        }
        var onClick = function (d) {
            countryName2.innerHTML = "Country Name: <b>" + d.name + "</b>";
            volumeOfSongs2.innerHTML = "Volume of songs: <b>" + d.TotalVolume + "</b>";
            volumeOfExplicitSongs2.innerHTML = "Volume of explicit songs: <b>" + d.ExplicitVolume + "</b>";
            volumeOfNonExplicitSongs2.innerHTML = "Volume of non-explicit songs: <b>" + d.NonExplicitVolume + "</b>";
            percentExplicitSongs2.innerHTML = "% of explicit songs: <b>" + parseFloat(d.Ratio).toFixed(2) + "%" + "</b>";
        }

        // Fit the projection to the size of the SVG container
        projection.fitSize([width, height], geojson);

        var size = d3.scaleSqrt()
            .domain([1, maxTotalValue])  // What's in the data
            .range([3, 60])  // Size in pixel

        // Use the updated projection to create your map path
        svg
            .append("path")
            .attr("fill", "#b8b8b8")
            .style("stroke", "black")
            .style("opacity", .3)
            .datum(geojson)
            .attr("d", path)
            .attr("class", "feature");

        svg
            .selectAll("myCircles")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.longitude, d.latitude])[0];
            })
            .attr("cy", function (d) {
                return projection([d.longitude, d.latitude])[1];
            })
            .attr("r", function (d) {
                return size(d.TotalVolume)
            })
            .style("fill", function (d) {
                return colorScale(d.Ratio)
            })
            .attr("stroke", function (d) {
                return "black"
            })
            .attr("stroke-width", 1)
            .attr("fill-opacity", .2)
            .on("mouseover", mouseover)
            .on("click", onClick)

        // Add legend: circles
        var valuesToShow = [TransformedMax/25, TransformedMax/5, TransformedMax]
        var xCircle = 150
        var xLabel = 200
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function (d) {
                return height - size(d) - 40
            })
            .attr("r", function (d) {
                return size(d)
            })
            .style("fill", "none")
            .attr("stroke", "black")

        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function (d) {
                return xCircle + size(d)
            })
            .attr('x2', xLabel + 25)
            .attr('y1', function (d) {
                return height - size(d) - 40
            })
            .attr('y2', function (d) {
                return height - size(d) - 40
            })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel + 25)
            .attr('y', function (d) {
                return height - size(d) - 40
            })
            .text(function (d) {
                return d
            })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .selectAll("stop")
            .data([
                {offset: "0%", color: colorScale(0)},
                {offset: "25%", color: colorScale(1.25)},
                {offset: "50%", color: colorScale(2.50)},
                {offset: "75%", color: colorScale(3.75)},
                {offset: "100%", color: colorScale(5)},
            ])
            .enter()
            .append("stop")
            .attr("offset", (d) => d.offset)
            .attr("stop-color", (d) => d.color);

        svg
            .append("rect")
            .attr("x", 500)
            .attr("y", 800)
            .attr("width", 300)
            .attr("height", 50)
            .attr("fill", "url(#gradient)");

        var gradientValues = [0, 2.5, 5]

        svg
            .selectAll("legend")
            .data(gradientValues)
            .enter()
            .append("text")
            .attr('x', function (d) {
                return 500 + 60 * d
            })
            .attr('y', 875)
            .text(function (d) {
                return d + "%"
            })
            .style("font-size", 14)
            .attr('alignment-baseline', 'middle')

    })
}

document.getElementById("validate-button").addEventListener("click", function () {
    // Remove everuthing in the svg
    svg.selectAll("circle").remove();
    svg.selectAll(".feature").remove();
    svg.selectAll("line").remove();
    svg.selectAll("text").remove();
    svg.selectAll("rect").remove();
    const removeUSCheckbox = document.getElementById("checkbox1").checked;

    // Retrieve the value of the "Decade" combobox
    const decadeSelect = document.getElementById("combo1");
    const selectedDecade = decadeSelect.options[decadeSelect.selectedIndex].value;

    loadData(removeUSCheckbox, selectedDecade);
});

loadData(false, "all");