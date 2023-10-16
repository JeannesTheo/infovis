async function getJson(url) {
    const response = await fetch('data.json');
    return await response.json();
}
let persons = [
    {
    "name": "Jean-Claude",
    "role": "victime",
    "metier": "enseignant",
    "position": {
        "x": 115,
        "y": 115
    },
    "taille": 171,
    "age": 54,
    "alibi": 1,
    "permisArme": "non",
    "vision": 8
},
    {
        "name": "John",
        "role": "suspect",
        "metier": "boucher",
        "position": {
            "x": 80,
            "y": 80
        },
        "taille": 175,
        "age": 37,
        "alibi": 4,
        "permisArme": "oui",
        "vision": 8
    }]
function init(persons) {
    let width = 1250,
        height = 1050,
        rescaledWidth = document.getElementById('scene').clientWidth,
        rescaledHeight = document.getElementById('scene').clientHeight,
        svg = d3.select('#scene').attr("width", width).attr("height", height);

    let xScale = d3.scaleLinear().domain([0, width]).range([0, rescaledWidth*8]);
    let yScale = d3.scaleLinear().domain([0, height]).range([0, rescaledHeight*8]);
    svg.selectAll('circle')
        .data(persons.filter(d => d.permisArme === "oui"))
        .enter()
        .append('circle')
        .attr("stroke-width", d => {
            return d.vision*2
        })
        .attr('stroke-opacity', 1)
        .attr("cx", d => xScale(d.position.x))
        .attr("cy", d => yScale(d.position.y))
        .attr('stroke', 'yellow')
        .attr("r", d => {
            dim = d3.max(persons, d => d.taille) - d3.min(persons, d => d.taille)
            return 15 + (d.taille - d3.min(persons, d => d.taille)) / dim * 10  + d.vision
        })
        .attr('fill', d => {
            if (d.role === "victime") {
                return 'red'
            } else if (d.role === "suspect") {
                return 'blue'
            } else {
                return 'green'
            }
        })
        .attr('opacity', d => {
            return 1 - (d.alibi / 10)
        })

    svg.selectAll('rect')
        .data(persons.filter(d => d.permisArme !== "oui"))
        .enter()
        .append('rect')
        .attr("stroke-width", d => {
            return d.vision*2
        })
        .attr('stroke-opacity', 1)
        .attr("x", d => {
            dim = d3.max(persons, d => d.taille) - d3.min(persons, d => d.taille)
            t = 25 + (d.taille - d3.min(persons, d => d.taille)) / dim * 10  + d.vision
            return xScale(d.position.x) - t/2
        })
        .attr("y", d => {
            dim = d3.max(persons, d => d.taille) - d3.min(persons, d => d.taille)
            t = 25 + (d.taille - d3.min(persons, d => d.taille)) / dim * 10  + d.vision
            return yScale(d.position.y) - t/2
        })
        .attr('stroke', 'yellow')
        .attr("width", d => {
            dim = d3.max(persons, d => d.taille) - d3.min(persons, d => d.taille)
            return 25 + (d.taille - d3.min(persons, d => d.taille)) / dim * 10  + d.vision
        })
        .attr("height", d => {
            dim = d3.max(persons, d => d.taille) - d3.min(persons, d => d.taille)
            return 25 + (d.taille - d3.min(persons, d => d.taille)) / dim * 10  + d.vision
        })
        .attr('fill', d => {
            if (d.role === "victime") {
                return 'red'
            } else if (d.role === "suspect") {
                return 'blue'
            } else {
                return 'green'
            }
        })
        .attr('opacity', d => {
            return 1 - (d.alibi / 10)
        })

    let labelGroup = svg.selectAll('g.person')
        .data(persons)
        .enter()
        .append('g')
        .attr('class', 'person')
        .attr('transform', d => `translate(${xScale(d.position.x)+ 7}, ${yScale(d.position.y)})`)

    labelGroup.append('rect')
        .attr('width', d => d.name.length * 10 + 5)
        .attr('stroke-width', 2)
        .attr('stroke', 'black')
        .attr('height', 17)
        .attr('fill', 'white')

    labelGroup.append('text')
        .text(d => d.name)
        .attr('y', 13)
        .attr('x', d => d.name.length * 10 + 2)
        .attr('fill', 'black')
        .attr('text-anchor', 'end')
        .attr("font-size", ".8em")
}

onload = function () {
    // init(persons);
    getJson().then(data => {
        console.log(data);
        persons = data['persons'];
        init(data['persons']);
    })
}