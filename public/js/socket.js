
const socketUrl = window.location.href;
console.log("Connect to socket at " + socketUrl);
const socket = io(socketUrl);

socket
    .on("connect", () => {
        console.log("Socket connect success");
    })
    .on("disconnect", () => {
        console.log("Socket disconnect");
    })
    .on("newMsg", (event) => {
        console.log("NEW MESSAGE WOW", event);
    });

socket.connect();