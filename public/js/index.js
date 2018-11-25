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
    let fontSize;
    let size;
    switch(type){
        case "channel":
            color = {
                border: '#4D005B',
                background: "#7D0094",
                highlight: {
                    border: '#4D005B',
                    background: '#7D0094',
                },
                hover: {
                    background: '#7D0094',
                    border: '#4D005B',
                }
            };

            size = 75;
            fontSize = 24;
            break;
        case "user":
            color = {
                border: '#350B62',
                background: '#8057AD',
                highlight: {
                    border: '#350B62',
                    background: '#8057AD',
                },
                hover: {
                    background: '#8057AD',
                    border: '#350B62',
                }
            };

            size = 16;
            fontSize = 12;

            break;
        case "admin":
            color = {
                border: '#004B4F',
                background: '#008E95',
                highlight: {
                    border: '#004B4F',
                    background: '#008E95',
                },
                hover: {
                    background: '#008E95',
                    border: '#004B4F',
                }
            };

            size = 32;
            fontSize = 18;

            break;
        default:
            color = "yellow";
    }

    const node = {
        id: id,
        label: label,
        color: color,
        font: {
            size: fontSize,
            color: "white"
        },
        size: size,
        shape: "dot"
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
        const type = user.isAdmin ? "admin" : "user";
        return createNode(user.id, user.name, type);
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
        shadow: {
            enabled: false,
            color: 'black',
            size: 20,
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
        // enabled: false,
        maxVelocity: 50,
        minVelocity: 0.5,
        stabilization: {
            enabled: false
        },
        repulsion: {
            centralGravity: 0.9,
            springLength: 300,
            springConstant: 0.03,
            nodeDistance: 40,
            damping: 0.09,
        },
    },
    edges:{
        width: 5,
        color: {
            color:'#848484',
            opacity:0.5,
            highlight: '#D845FF',
            hover: '#D845FF',
          },
        length: 500,
    },
};

function isConnectedTo(nodeID, otherNodeID, edges) {
    return null != edges.find( (edge) => {
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

    //console.log("networkdata", networkData);
    const channelNodes = createChannelNodes(networkData.channels, selectedNodeID);
    const userNodes = createUserNodes(networkData.users, selectedNodeID);

    let nodesArray = channelNodes.concat(userNodes);
    const edgesArray = createEdges(networkData.interactions);
    console.log("edges are", edgesArray);

    if (selectedNodeID != null) {
        // Find the user/channel with this ID
        const name = (networkData.channels.concat(networkData.users)).find( (node) => node.id === selectedNodeID).name;

        const currentTitle = $("#title").html();
        $("#title").html(currentTitle + " - " + name);
        //console.log("user/channel name is " + name);

        //console.log(`Before selecting there are ${nodesArray.length} nodes`);

        const filteredNodes = [];
        for (node of nodesArray) {
            // console.log("node", node);
            if (filteredNodes.find( (n) => n.id === node.id) != null) {
                // console.log("Node is already in filtered result", node);
                continue;
            }
            if (node.id === selectedNodeID || isConnectedTo(selectedNodeID, node.id, edgesArray)) {
                // console.log("Push node", node);
                filteredNodes.push(node);
            }
        }
        nodesArray = filteredNodes;

        //console.log(`after selecting there are ${nodesArray.length} nodes`);
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
        if (clickedNodeID != null) {
            window.location.href = "/u/" + clickedNodeID;
        }
    });

    network.on("click", (event) => {
        const clickedNodeID = event.nodes[0];
        if (clickedNodeID != null) {
            window.location.href = "?node=" + clickedNodeID;
        }
    });

});
