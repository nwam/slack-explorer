serverUrl = 'http://localhost:3000';
id = window.nodeID;
targetWordSize = 10;
route = `/db/u/${id}`;

if (id == 0) {
    route = '/db/overview/'
}

$.get(`${serverUrl}${route}`, (data) => {
    // CLOUD
    console.log("OG data:", data);
    const words = data.words;
    let avgWordSize = 0;
    console.log(words);
    words.map( (w) => {avgWordSize+=w.size;});
    avgWordSize /= words.length;
    console.log(words);


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

    var fill = d3.scale.category20();
    var layout = d3.layout.cloud()
        .size([1000, 1000])
        .words(words)
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size*targetWordSize/avgWordSize; })
        .on("end", draw);

    layout.start();

    // CHART
    var ctx = document.getElementById('chart').getContext('2d');
    const timeCounts = data.timeCounts;
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: timeCounts.times,
            datasets: [{
                label: "Number of posts",
                borderColor: '#008E95',
                data: timeCounts.counts,
            }]
        },
        options: {
            responsive: true,
        }
    });
});