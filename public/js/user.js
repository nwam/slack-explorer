serverUrl = 'http://localhost:3000';
userId = window.nodeID;

// CLOUD
$.getJSON(`${serverUrl}/db/user/${userId}`, (userData) => {
    const userWords = userData.words;

    var fill = d3.scale.category20();
    var layout = d3.layout.cloud()
        .size([1000, 1000])
        .words(userWords)
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size*10; })
        .on("end", draw);

    layout.start();

    function draw(words) {
        d3.select("body").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
    }	
});
// CHART
var container = document.getElementById('chart');
var items = [
    {x: '2014-06-11', y: 10},
    {x: '2014-06-12', y: 25},
    {x: '2014-06-13', y: 30},
    {x: '2014-06-14', y: 10},
    {x: '2014-06-15', y: 15},
    {x: '2014-06-16', y: 30}
];

var dataset = new vis.DataSet(items);
var options = {
    start: '2014-06-10',
    end: '2014-06-18'
};
var Graph2d = new vis.Graph2d(container, dataset, options);

