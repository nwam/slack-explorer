var ctx = document.getElementById('chart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [{
                x: 0,
                y: 0
            },{
                x: 3,
                y: 1
            },{
                x: 8,
                y: 2
            },{
                x: 9,
                y: 3
            }]
        }]
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    min: 0,
                    max: 10,
                }
            }]
        },
        responsive: true,
    }
});