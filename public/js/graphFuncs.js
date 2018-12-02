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
