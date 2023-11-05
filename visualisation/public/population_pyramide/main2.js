
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
var DataNumber = [
  {group: '1963-1972', explicit: 13, non_explicit: 1870, populargroupeexp: "The Doors, Claude François, The Isley Brothers", populargroupe_non_exp: "The Beatles, Otis Redding, Stevie Wonder", populargenre_non_exp: "Folkmusic, Folkrock, Popmusic, Softrock, Soulmusic", populargenre_exp: "", countryexp: "France ,United States", countrynoexp: "Netherlands ,Japan"},
  {group: '1973-1982', explicit: 106, non_explicit: 5323, populargroupeexp: "Prince, Violent Femmes, Claude François", populargroupe_non_exp: "Michael Jackson, Queen, Bob Marley & The Wailers", populargenre_non_exp: "Countrymusic, Disco, Folkrock, Hardrock, Softrock", populargenre_exp: "Bluesrock, Hardrock, Rockmusic, Soulmusic", countryexp: "United States ,United Kingdom", countrynoexp: "Sweden ,Turkey"},
  {group: '1983-1992', explicit: 742, non_explicit: 40150, populargroupeexp: "Depeche Mode, Red Hot Chili Peppers, Rage Against The Machine", populargroupe_non_exp: "Queen, ABBA, Nirvana", populargenre_non_exp: "Countrymusic, Hardrock, Newwavemusic, Popmusic, Rockmusic", populargenre_exp: "Alternativerock, Funkrock, Heavymetalmusic, Hiphopmusic, Jazz", countryexp: "United States ,United Kingdom", countrynoexp: "Austria ,Chile ,Reunion"},
  {group: '1993-2002', explicit: 11302, non_explicit: 170992, populargroupeexp: "Eminem, Maroon, Romeo", populargroupe_non_exp: "Coldplay, Louise Attaque", populargenre_non_exp: "Alternativerock, Countrymusic, Hardrock, Popmusic, Rockmusic", populargenre_exp: "Alternativerock, EastCoasthiphop, Hardrock, Hiphopmusic, Numetal", countryexp: "United States ,United Kingdom", countrynoexp: "Singapore ,Hong Kong ,Philippines"},
  {group: '2003-2012', explicit: 46708, non_explicit: 710229, populargroupeexp: "Adele, David Guetta, Macklemore & Ryan Lewis", populargroupe_non_exp: "Bruno Mars, Coldplay, Muse", populargenre_non_exp: "Countrymusic, Hardrock, Popmusic, Poprock, Rockmusic", populargenre_exp: "Alternativemetal, Alternativerock, ContemporaryR&B, Hardrock, Hiphopmusic", countryexp: "United States ,United Kingdom", countrynoexp: "Ireland ,Puerto Rico , Israel"},
  {group: '2013-2017', explicit: 12558, non_explicit: 165948, populargroupeexp: "Maitre Gims, Eminem, Rihanna", populargroupe_non_exp: "Stromae, Ed Sheeran, Daft Punk", populargenre_non_exp: "Countrymusic, Hardrock, Popmusic, Poprock, Rockmusic", populargenre_exp: "Alternativehiphop, ContemporaryR&B, Hiphopmusic, Raprock, Popmusic", countryexp: "United States ,XW", countrynoexp: "Canada ,Netherlands ,Italy"},
];
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
var totalPopulation = d3.sum(DataNumber, function(d) { return d.explicit + d.non_explicit; }),
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
  d3.max(DataNumber, function(d) { return percentage(d.explicit); }),
  d3.max(DataNumber, function(d) { return percentage(d.non_explicit); })
);

// SET UP SCALES

// the xScale goes from 0 to the width of a region
//  it will be reversed for the left x-axis
// Replace d3.scale.linear() with d3.scaleLinear()
var xScale = d3.scaleLog() // Use logarithmic scale
  .domain([1, maxValue]) // Logarithmic scale requires a positive domain
  .range([0, regionWidth])
  .nice();

var xScaleLeft = d3.scaleLog() // Use logarithmic scale
  .domain([1, maxValue]) // Logarithmic scale requires a positive domain
  .range([regionWidth, 0]);

var xScaleRight = d3.scaleLog() // Use logarithmic scale
  .domain([1, maxValue]) // Logarithmic scale requires a positive domain
  .range([0, regionWidth]);

var yScale = d3.scaleBand()
  .domain(DataNumber.map(function(d) { return d.group; }))
  .rangeRound([h, 0])
  .padding(0.1);



var yAxisLeft = d3.axisLeft(yScale)
  .tickSize(4)
  .tickPadding(margin.middle - 4);

var yAxisRight = d3.axisRight(yScale)
  .tickSize(4)
  .tickFormat('');


var xAxisRight = d3.axisBottom(xScale)
  .ticks(5, ",.0s"); // You can customize the number of ticks and format as needed

var xAxisLeft = d3.axisBottom(xScaleLeft)
  .ticks(5, ",.0s"); // You can customize the number of ticks and format as needed

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
  .data(DataNumber)
  .enter().append('rect')
    .attr('class', 'bar left')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d.group); })
    .attr('width', function(d) { return xScale(percentage(d.explicit)); })
    .attr('height', yScale.bandwidth())
    .on('mouseover', function(d) {
      d3.select(this).classed('highlighted', true);
    })
    .on('mouseout', function() {
      d3.select(this).classed('highlighted', false);
    })
    .on('click', function(d) {
      var group = d.group;
      var maleValue = d.explicit;


      displayInfo(group, 'Number of explicite musics: ' + maleValue, xScale(percentage(maleValue)),"Most popular groupe: " +d.populargroupeexp,"Most popular genre: "+ d.populargenre_exp,"Most popular country: "+ d.countryexp);
    });


rightBarGroup.selectAll('.bar.right')
  .data(DataNumber)
  .enter().append('rect')
    .attr('class', 'bar right')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d.group); })
    .attr('width', function(d) { return xScale(percentage(d.non_explicit)); })
    .attr('height', yScale.bandwidth())
    .on('mouseover', function(d) {
      d3.select(this).classed('highlighted', true);
    })
    .on('mouseout', function() {
      d3.select(this).classed('highlighted', false);
    })
    .on('click', function(d) {
      displayInfo(d.group, 'Number of Non-explicite musics: ' + d.non_explicit, xScale(percentage(d.non_explicit)),"Most popular groupe: " +d.populargroupe_non_exp,"Most popular genre: "+ d.populargenre_non_exp,"Most popular country: "+ d.countrynoexp);
    });


function displayInfo(group, info, value,popgroupe,popgenre,popcountry) {
  var infoDiv = d3.select('#info');
  infoDiv.html('<h3>' + group + '</h3><p>' + info + '</p><p>' + popgroupe + '</p><p>' + popgenre + '</p><p>' + popcountry + '</p>');
  infoDiv.style('display', 'block'); // Afficher la fenêtre d'information
}




// Créez un conteneur pour afficher les informations
var infoContainer = d3.select('body').append('div')
  .attr('id', 'info')
  .style('position', 'absolute')
  .style('right', '10px')
  .style('top', '80px')
  .style('background-color', 'white')
  .style('border', '1px solid #ccc')
  .style('padding', '10px')
  .style('display', 'none');

// so sick of string concatenation for translations
function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';

}

