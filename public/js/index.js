serverUrl = 'http://localhost:3000';

getQueryStringParams = query => {
    return query
        ? (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                    let [key, value] = param.split('=');
                    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                    return params;
                }, {}
            )
        : {}
};

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
        return createNode(channel.id, channel.name, 'channel');
    });
}

function createUserNodes(users) {
    return users.map( (user) => {
        return createNode(user.id, user.name, 'user');
    });
}

function createEdges(interactions) {
    return interactions.map ( (i) => {
        return createEdge(i.userId, i.channelId, i.count);
    });
}

const options = {
    layout: { improvedLayout: false },
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
        enabled: false,
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

function isConnectedTo(nodeID, otherNodeID, edges) {
    return edges.find( (edge) => {
        //console.log("edge", edge);
        // console.log("edge.from", edge.from, "edge.to", edge.from);
        // console.log("nodeID", nodeID, "otherNodeID", otherNodeID);
        return (edge.from === nodeID && edge.to === otherNodeID) || (edge.from === otherNodeID && edge.to === nodeID)
    });
}

$.getJSON(`${serverUrl}/db/network`, (networkData) => {
    const qs = getQueryStringParams(window.location.search.substr(1));
    const selectedNodeID = qs.node;
    console.log("qs", qs, "selectedNode", selectedNodeID);

    console.log("networkdata", networkData);
    const channelNodes = createChannelNodes(networkData.channels, selectedNodeID);
    const userNodes = createUserNodes(networkData.users, selectedNodeID);

    let nodesArray = channelNodes.concat(userNodes);
    const edgesArray = createEdges(networkData.interactions);

    if (selectedNodeID != null) {
        // Find the user/channel with this ID
        const name = (networkData.channels.concat(networkData.users)).find( (node) => node.id === selectedNodeID).name;

        const currentTitle = $("#title").html();
        $("#title").html(currentTitle + " - " + name);
        console.log("user/channel name is " + name);

        console.log(`Before selecting there are ${nodesArray.length} nodes`);

        const filteredNodes = [];
        for (node of nodesArray) {
            // console.log("node", node);
            if (node.id === selectedNodeID || isConnectedTo(selectedNodeID, node.id, edgesArray)) {
                // console.log("Push node", node);
                filteredNodes.push(node);
            }
        }
        nodesArray = filteredNodes;

        console.log(`after selecting there are ${nodesArray.length} nodes`);
        /*
        edges = edges.reduce( (tempEdges, edge) => {

        }, []);*/
    }

    const nodes = new vis.DataSet(nodesArray);
    const edges = new vis.DataSet(edgesArray);

    // create a network
    const container = document.getElementById('viewport');

    // provide the data in the vis format
    const data = {
        nodes: nodes,
        edges: edges
    };

    // initialize your network!
    const network = new vis.Network(container, data, options);

    network.on("doubleClick", (event) => {
        const clickedNodeID = event.nodes[0];
        window.location.href = "/u/" + clickedNodeID;
    });

    network.on("click", (event) => {
        const clickedNodeID = event.nodes[0];
        window.location.href = "?node=" + clickedNodeID;
    });

});
