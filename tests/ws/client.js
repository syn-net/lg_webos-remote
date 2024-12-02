// var W3CWebSocket = require('websocket').w3cwebsocket;
let HOST = `localhost`;
let PORT = 3000;
let wsurl = `ws://${HOST}:${PORT}`;
var client = new WebSocket(wsurl, `echo-protocol`);
// var client = new W3CWebSocket(wsurl, `echo-protocol`);

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');

    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};
