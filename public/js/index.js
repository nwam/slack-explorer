serverUrl = 'http://localhost:3000';

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

function createChannelNodes(channels) {
    return channels.map( (channel) => {
        return createNode(channel.channelId, channel.channelName, 'channel');
    });
}

function createUserNodes(users) {
    return users.map( (user) => {
        return createNode(user.userId, user.userName, 'user');
    });
}

function createEdges(interactions) {
    return interactions.map ( (i) => {
        return createEdge(i.userId, i.channelId, i.count);
    });
}

var options = {
    nodes:{
        borderWidth: 1,
        borderWidthSelected: 3,
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

$.getJSON(`${serverUrl}/db/network`, (networkData) => {
    const channelNodes = createChannelNodes(networkData.channels);
    const userNodes = createUserNodes(networkData.users);
    const nodes = new vis.DataSet(channelNodes.concat(userNodes));
    const edges = new vis.DataSet(createEdges(networkData.interactions));

    // create a network
    var container = document.getElementById('viewport');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);

    network.on("doubleClick", function (event) {
        const clickedNodeID = event.nodes[0];
        window.location.href = "/u/" + clickedNodeID;
    });

});
