function createNode(id, label, type) {
    let color;
    switch(type){
        case "channel":
            color = {
                border: '#5d478b',
                background: 'rgba(165, 107, 223, 1)',
                highlight: {
                    border: '#5d478b',
                    background: 'rgba(165, 107, 223, 0.7)',
                },
                hover: {
                    background: 'rgba(165, 107, 223, 0.7)',
                    border: '#5d478b',
                }
            },
            font = {
                size: 20,
                color: 'white'
            }
            break;
        case "user":
            color = {
                border: '#4f4f4f',
                background: '#949494',
                highlight: {
                    border: '#4f4f4f',
                    background: '#adadad',
                },
                hover: {
                    background: '#adadad',
                    border: '#4f4f4f',
                }
            },
            font = {
                size: 15,
                color: '#4f4f4f'
            }
            break;
        default:
            color = "yellow";
    }

    const node = {
        id: id,
        label: label,
        color: color,
        font: font,
    };

    return node;
}

function createEdge(from, to, width){
    const edge = {
        from: from,
        to: to,
        width: width,
    };

    return edge
}

// create an array with nodes
 var nodes = new vis.DataSet([
    createNode('1', "#channel1", "channel"),
    createNode(2, "username1", "user"),
    createNode(3, "username2", "user"),
    createNode(4, "#channel2", "channel"),
    createNode(5, "username3", "user"),
    createNode(6, "username4", "user"),
    createNode(7, "username5", "user"),
    createNode(8, "LONELY"),
]);

// create an array with edges
var edges = new vis.DataSet([
    createEdge('1', 3, 10),
    {from: '1', to: 2},
    createEdge(4, 5, 20),
    {from: 4, to: 6},
    {from: 4, to: 7}
]);

// create a network
var container = document.getElementById('viewport');

// provide the data in the vis format
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    nodes:{
        borderWidth: 1,
        borderWidthSelected: 3,
        opacity: 0.5,
        color: {
          border: '#2B7CE9',
          background: '#97C2FC',
          highlight: {
            border: '#2B7CE9',
            background: '#D2E5FF',
          },
        },
        shape: 'circle',
        font: {
            color: 'white',
            size: 14, // px
            face: 'arial',
            background: 'none',
            align: 'center',
        },
    },
    interaction:{
        dragNodes:true,
        dragView: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: true,
        hoverConnectedEdges: true,
        keyboard: {
          enabled: false,
          speed: {x: 10, y: 10, zoom: 0.02},
          bindToWindow: true,
        },
        multiselect: false,
        navigationButtons: false,
        selectable: true,
        selectConnectedEdges: true,
        tooltipDelay: 300,
        zoomView: true,
    },
    physics:{
        maxVelocity: 50,
        minVelocity: 0.5,
        stabilization: {
            enabled: false,
        },
        repulsion: {
            centralGravity: 0.9,
            springLength: 300,
            springConstant: 0.03,
            nodeDistance: 35,
            damping: 0.09,
        },
    },
    edges:{
        width: 5,
        color: {
            color:'#848484',
            opacity:1.0,
            inherit: 'from',
          },
        length: 200,
    }
};

// initialize your network!
var network = new vis.Network(container, data, options);

network.on("click", function (params) {
    params.event = "[original event]";
    document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
    console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
});

