// relies on graphFuncs.js

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

const ERR_OUTPUT = "#err-output";

function onSearch() {
    const username = $("#search-input").val();
    console.log("input username", username);
    if (username == "") {
        $(ERR_OUTPUT).text("Enter a username to look up");
        return;
    }

    $.ajaxSetup({ timeout:1000 });
    $.get(`${serverUrl}/db/getid/${username}`, (data) => {
        window.location.href = "/?node=" + data
    }).fail( (err) => {
        console.error("get fail", err);
        $(ERR_OUTPUT).text("Failed to find username " + username);
    });
}

function fetch() {
    $("html").css("cursor", "wait");

    $.post("/db/fetch")
    .done( () => {
        console.log("Done fetch");
        // window.location.pathname = "/";
        window.location.reload();
    })
    .fail( (err) => {
        $(ERR_OUTPUT).text(JSON.stringify(err));
    })
    .always( () => {
        $("html").css("cursor", "auto");
    });
}