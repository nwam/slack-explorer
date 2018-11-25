serverUrl = 'http://localhost:3000';

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
    // console.log("label", label, "type", type);
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
        case "group":
            color = {
                border: '#4D005B',
                background: "green",
                highlight: {
                    border: '#4D005B',
                    background: 'green',
                },
                hover: {
                    background: 'green',
                    border: '4D005B',
                }
            };

            size = 65;
            fontSize = 20;
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

const WIDTH_FLOOR = 15;

function createEdge(from, to, width, label) {
    const edge = {
        from: from,
        to: to,
        width: width,
        label: label
    };

    return edge;
}

function createChannelNodes(channels) {
    return channels.map( (channel) => {
        console.log("channel", channel);
        const type = channel.isPrivate === true ? "group" : "channel";
        let name = channel.isPrivate === true ? channel.name : "#" + channel.name;
        if (name.startsWith("mpdm-")) {
            name = name.substring(5);
        }
        return createNode(channel.id, name, type);
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
        const actualWidth = i.count;
        let width = actualWidth;
        let label = "";
        if (width >= WIDTH_FLOOR) {
            label = "" + width;
        }

        if (width > 30 && i.channelId === "GEAS9313N") {
            // lol
            width = 30;
        }

        return createEdge(i.userId, i.channelId, width, label);
    });
}

function getEdges(nodeID, otherNodeID, edges, dbug=false) {
    const filter = (edge) => {
        // if (dbug) {
            // console.log(`checkign edge from ${edge.from} to ${edge.to}, nodes are ${nodeID} and ${otherNodeID}`);
        // }
        const pass = (edge.from === nodeID && edge.to === otherNodeID) || (edge.from === otherNodeID && edge.to === nodeID);
        // if (pass) {
        //     console.log("Edge", edge, "matches nodes", nodeID, otherNodeID);
        // }
        return pass;
    };
    return edges.get({ filter: filter });
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
    let edges = new vis.DataSet(edgesArray);

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
                console.log("Node is already in filtered result", node);
                continue;
            }
            const existingEdges = getEdges(selectedNodeID, node.id, edges);
            // console.log("EE", existingEdges);
            if (node.id === selectedNodeID || existingEdges.length > 0) {
                // console.log("Push node", node);
                filteredNodes.push(node);
            }
        }
        nodesArray = filteredNodes;

        //console.log(`after selecting there are ${nodesArray.length} nodes`);
    }

    const nodes = new vis.DataSet(nodesArray);

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

    const EVENT_MESSAGE = "message";
    const EVENT_NEW_RXN = "reaction_added";
    const EVENT_RXN_REMOVED = "reaction_removed"
    window.socket
        .on(EVENT_MESSAGE, (event) => {
            console.log("NEW MESSAGE", event);

            const existingEdge = getEdges(event.user, event.channelID, edges, true)[0];
            if (existingEdge == null) {
                console.log("adding new edge, edges before", edges);
                edges.add({
                    from: event.user,
                    to: event.channel,
                    width: 1
                });
                console.log("edges after insert", edges);
            }
            else {
                const newWidth =  Number(existingEdge.width) + 1;
                const newLabel = newWidth > WIDTH_FLOOR ? newWidth.toString() : "";
                edges.update({
                    id: existingEdge.id,
                    from: existingEdge.from,
                    to: existingEdge.to,
                    width: newWidth,
                    label: newLabel
                });
            }
        })
        .on(EVENT_NEW_RXN, (event) => {
            console.log("NEW REACTION WOW", event);
        })
        .on(EVENT_RXN_REMOVED, (event) => {
            console.log("Reaction gone, who cares tho", event);
        });

});
