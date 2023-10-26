onload = function (){
    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 1700 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom;

// append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the Data
    d3.csv("occurences_genres.csv").then ( function(data) {

    let filteredData = data.filter(d => d.Value > 1000);

    // Sélectionnez le corps de la page
    const body = document.querySelector('body');

    // Créez un élément de paragraphe (p)
    const paragraphe = document.createElement('p');

    // Définissez le texte à afficher dans le paragraphe
    paragraphe.textContent = `Les genres affichés représentent ${((d3.sum(filteredData,d => d.Value)/d3.sum(data,d => d.Value)) * 100).toFixed(2)}% du dataset`;

    // Ajoutez le paragraphe au corps de la page
    body.appendChild(paragraphe);

    console.log(d3.sum(filteredData,d => d.Value)/d3.sum(data,d => d.Value))
// sort data
        filteredData.sort(function(b, a) {
            return a.Value - b.Value;
        });

// X axis
        const x = d3.scaleBand()
            .range([ 0, width ])
            .domain(filteredData.map(d => d.Genre))
            .padding(0.2);
        console.log(x)
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

// Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 50000])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

// Bars
        svg.selectAll("mybar")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.Genre))
            .attr("y", d => y(d.Value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Value))
            .attr("fill", "#69b3a2")

    })
}