
// SET UP DIMENSIONS
var w = 1500,
    h = 900;

// margin.middle is distance from center line to each y-axis
var margin = {
  top: 20,
  right: 20,
  bottom: 24,
  left: 20,
  middle: 0
};

// the width of each side of the chart
var regionWidth = w/2 - margin.middle;

// these are the x-coordinates of the y-axes
var pointA = regionWidth,
    pointB = w - regionWidth;

// some contrived data
var exampleData = [
  {group: '0-9', male: 10, female: 12},
  {group: '10-19', male: 14, female: 15},
  {group: '20-29', male: 15, female: 18},
  {group: '30-39', male: 18, female: 18},
  {group: '40-49', male: 21, female: 22},
  {group: '50-59', male: 19, female: 24},
  {group: '60-69', male: 15, female: 14},
  {group: '70-79', male: 8, female: 10},
  {group: '80-89', male: 4, female: 5},
  {group: '90-99', male: 2, female: 3},
  {group: '100-109', male: 1, female: 1},
];

// GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
var totalPopulation = d3.sum(exampleData, function(d) { return d.male + d.female; }),
    percentage = function(d) { return d;}; /// totalPopulation; };


// CREATE SVG
var svg = d3.select('body').append('svg')
  .attr('width', margin.left + w + margin.right)
  .attr('height', margin.top + h + margin.bottom)
  // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
  .append('g')
    .attr('transform', translation(margin.left, margin.top));

// find the maximum data value on either side
//  since this will be shared by both of the x-axes
var maxValue = Math.max(
  d3.max(exampleData, function(d) { return percentage(d.male); }),
  d3.max(exampleData, function(d) { return percentage(d.female); })
);

// SET UP SCALES

// the xScale goes from 0 to the width of a region
//  it will be reversed for the left x-axis
// Replace d3.scale.linear() with d3.scaleLinear()
var xScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0, regionWidth])
  .nice();


var xScaleLeft = d3.scaleLinear()
  .domain([0, maxValue])
  .range([regionWidth, 0]);

var xScaleRight = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0, regionWidth]);

var yScale = d3.scaleBand()
  .domain(exampleData.map(function(d) { return d.group; }))
  .rangeRound([h, 0])
  .padding(0.1);



var yAxisLeft = d3.axisLeft(yScale)
  .tickSize(4)
  .tickPadding(margin.middle - 4);

var yAxisRight = d3.axisRight(yScale)
  .tickSize(4)
  .tickFormat('');


var xAxisRight = d3.axisBottom(xScale);
// .tickFormat(d3.format('%'));

var xAxisLeft = d3.axisBottom(xScale.copy().range([pointA, 0]));
 // .tickFormat(d3.format('%'));

// MAKE GROUPS FOR EACH SIDE OF CHART
// scale(-1,1) is used to reverse the left side so the bars grow left instead of right
var leftBarGroup = svg.append('g')
  .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
var rightBarGroup = svg.append('g')
  .attr('transform', translation(pointB, 0));

// DRAW AXES
svg.append('g')
  .attr('class', 'axis y left')
  .attr('transform', translation(pointA, 0))
  .call(yAxisLeft)
  .selectAll('text')
  .style('text-anchor', 'middle');

svg.append('g')
  .attr('class', 'axis y right')
  .attr('transform', translation(pointB, 0))
  .call(yAxisRight);

svg.append('g')
  .attr('class', 'axis x left')
  .attr('transform', translation(0, h))
  .call(xAxisLeft);

svg.append('g')
  .attr('class', 'axis x right')
  .attr('transform', translation(pointB, h))
  .call(xAxisRight);

// DRAW BARS
leftBarGroup.selectAll('.bar.left')
  .data(exampleData)
  .enter().append('rect')
    .attr('class', 'bar left')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d.group); })
    .attr('width', function(d) { return xScale(percentage(d.male)); })
    .attr('height', yScale.bandwidth())
    .on('mouseover', function(d) {
      d3.select(this).classed('highlighted', true);
    })
    .on('mouseout', function() {
      d3.select(this).classed('highlighted', false);
    })
    .on('click', function(d) {
      var group = d.group;
      var maleValue = d.male;

      console.log('Group:', d.group);
       console.log('Male Value:', d.male);
      displayInfo(group, 'Male: ' + maleValue, xScale(percentage(maleValue)));
    });


rightBarGroup.selectAll('.bar.right')
  .data(exampleData)
  .enter().append('rect')
    .attr('class', 'bar right')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d.group); })
    .attr('width', function(d) { return xScale(percentage(d.female)); })
    .attr('height', yScale.bandwidth())
    .on('mouseover', function(d) {
      d3.select(this).classed('highlighted', true);
    })
    .on('mouseout', function() {
      d3.select(this).classed('highlighted', false);
    })
    .on('click', function(d) {
      displayInfo("1"+d.group, 'Female: ' + d.female, xScale(percentage(d.female)));
    });


function displayInfo(group, info, value) {
  var infoDiv = d3.select('#info');
  infoDiv.html('<h3>' + group + '</h3><p>' + info + '</p><p>Tranche d\'age: ' + value + '</p>');
  infoDiv.style('display', 'block'); // Afficher la fenêtre d'information
}


// Créez un conteneur pour afficher les informations
var infoContainer = d3.select('body').append('div')
  .attr('id', 'info')
  .style('position', 'absolute')
  .style('right', '10px')
  .style('top', '10px')
  .style('background-color', 'white')
  .style('border', '1px solid #ccc')
  .style('padding', '10px')
  .style('display', 'none');

// so sick of string concatenation for translations
function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';

}