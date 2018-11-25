
const socketUrl = window.location.href;
console.log("Connect to socket at " + socketUrl);
const socket = io(socketUrl);

const EVENT_MESSAGE = "message";
const EVENT_NEW_RXN = "reaction_added";
const EVENT_RXN_REMOVED = "reaction_removed"

socket
    .on("connect", () => {
        console.log("Socket connect success");
    })
    .on("disconnect", () => {
        console.log("Socket disconnect");
    })
    .on(EVENT_MESSAGE, (event) => {
        console.log("NEW MESSAGE WOW", event);
    })
    .on(EVENT_NEW_RXN, (event) => {
        console.log("NEW REACTION WOW", event);
    })
    .on(EVENT_RXN_REMOVED, (event) => {
        console.log("Reaction gone, who cares tho", event);
    });

socket.connect();