function createNode(id, label, type) {
    let color;
    switch(type){
        case "channel":
        color = {
            border: '#2B7CE9',
            background: 'pink',
            highlight: {
                border: '#2B7CE9',
                background: '#D2E5FF',
            },
            hover: {
                background: 'white',
                border: 'white',
            }
        };
            break;
        case "user":
            color = {
                border: '#2B7CE9',
                background: '#97C2FC',
                highlight: {
                    border: '#2B7CE9',
                    background: '#D2E5FF',
                },
                hover: {
                    background: 'white',
                    border: 'white',
                }
            };
            break;
        default:
            color = "yellow";
    }

    const node = {
        id: id,
        label: label,
        color: color
    };

    return node;
}

// create an array with nodes
 var nodes = new vis.DataSet([
    createNode(1, "#channel1", "channel"),
    createNode(2, "username1", "user"),
    createNode(3, "username2", "user"),
    createNode(4, "#channel2", "channel"),
    createNode(5, "username3", "user"),
    createNode(6, "username4", "user"),
    createNode(7, "username5", "user"),
]);

// create an array with edges
var edges = new vis.DataSet([
    {from: 1, to: 3},
    {from: 1, to: 2},
    {from: 4, to: 5},
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
        borderWidthSelected: 2,
        brokenImage:undefined,
        chosen: true,
        color: {

          border: '#2B7CE9',
          background: '#97C2FC',
          highlight: {
            border: '#2B7CE9',
            background: '#D2E5FF',
          },
        },
        shape: 'circle',
        shapeProperties: {
          borderDashes: false, // only for borders
          borderRadius: 6,     // only for box shape
          interpolation: false,  // only for image and circularImage shapes
          useImageSize: false,  // only for image and circularImage shapes
          useBorderWithImage: false  // only for image shape
        },
        font: {
            color: 'white',
            size: 14, // px
            face: 'arial',
            background: 'none',
            strokeWidth: 0, // px
            strokeColor: '#ffffff',
            align: 'center',
            multi: false,
            vadjust: 0,
        },
    },
};

// initialize your network!
var network = new vis.Network(container, data, options);

