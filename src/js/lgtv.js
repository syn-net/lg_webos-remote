
//`use strict`;
const assert = require('node:assert');
const EventEmitter = require('node:events');
// const EventEmitter = require('./EventEmitter.js');

// IMPORTANT(JEFF): Omg, WebSockets is natively supported
// by Node v22.x and is allegedly compatible with the browser
// API. Let's try it out!

// https://www.npmjs.com/package/websocket
//import WebSocket from 'ws';
//const ws = require('ws');

// https://websockets.spec.whatwg.org//
//const ws = require('websocket').w3cwebsocket;
// const ws = require('websocket').client;

// IMPORTANT(JEFF): This should never assert until we have
// begun testing inside a browser!
assert.notEqual(ws,
  typeof window === "function" && window.WebSocket);

let handshaken = false;
let eventemitter = new EventEmitter();
assert.notEqual(eventemitter, null);

// connection to TV
var pointerSocket = null;
var ws = null;
//assert.notEqual(ws, null);
let wsurl = "ws://lgsmarttv.lan:3000";

let isConnected = false;

// bool for callbacks
const RESULT_ERROR = false;
const RESULT_OK = true;

// NOTE(JEFF): This object is only used in the NodeJS port of WebSockets.
//
// TODO(JEFF): Add this to the requestOptions object of the WebSocket connection handler
//
// 1. https://github.com/theturtle32/WebSocket-Node/blob/d87afb7ef28f9c2249aa764805af87846d46f522/docs/WebSocketClient.md
const requestOptions = {
    // TODO(JEFF): Verify that this is the correct origin
    origin: `chrome:///extensions`,
    agent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`,
};

const hello_w_key=`
{
    "id" : "register_0",
    "payload" : {      
    "client-key" : "CLIENTKEYGOESHERE",
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAja9OJLlg3FnIFOq/tgCB7qoDuMspUrJ3c34BEJU3qmshI45sBxhmjFQSgdsKek/5zYpQkdV1JxZD0mmqjdoQ/EkswH94HmjS9gv1WNc/Kimwxlv9+b0fDGoDmHsqKuIdfSASCGsa4JErrfyjqBUoErCeNjFlnnIit6BvsJqkQaejsejPg/ICbis2GgojbTAKwkvIhPTDxvhnY6CGmHVkBkmOBaFoGIpOyMvCc3CO65YcdfEMaM9SaafbFXNky07msJhBK4G2iPWHk5059+fGBFcRajd0pVRgYAKZJjtCjdx9dRCkScPBKn2PA3qKDZRUlDpy4pVmsDn3+GIe6bfs0QIDAQAB",
    "forcePairing" : false,
    "manifest" : {
      "appVersion" : "1.1",
       "manifestVersion" : 1,
       "permissions" : [
        "LAUNCH",
        "LAUNCH_WEBAPP",
        "APP_TO_APP",
        "CLOSE",
        "TEST_OPEN",
        "TEST_PROTECTED",
        "CONTROL_AUDIO",
        "CONTROL_DISPLAY",
        "CONTROL_INPUT_JOYSTICK",
        "CONTROL_INPUT_MEDIA_RECORDING",
        "CONTROL_INPUT_MEDIA_PLAYBACK",
        "CONTROL_INPUT_TV",
        "CONTROL_POWER",
        "READ_APP_STATUS",
        "READ_CURRENT_CHANNEL",
        "READ_INPUT_DEVICE_LIST",
        "READ_NETWORK_STATE",
        "READ_RUNNING_APPS",
        "READ_TV_CHANNEL_LIST",
        "WRITE_NOTIFICATION_TOAST",
        "READ_POWER_STATE",
        "READ_COUNTRY_INFO"
    ],
    "signatures" : [
    {
        "signature" : "eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw==",
        "signatureVersion" : 1
    }],
    "signed" : {
        "appId" : "com.lge.test",
        "created" : "20140509",
        "localizedAppNames" : {
            "" : "LG Remote App",
            "ko-KR" : "리모컨 앱",
            "zxx-XX" : "ЛГ Rэмotэ AПП"
        },
        "localizedVendorNames" : {
            "" : "LG Electronics"
        },
        "permissions" : [
            "TEST_SECURE",
            "CONTROL_INPUT_TEXT",
            "CONTROL_MOUSE_AND_KEYBOARD",
            "READ_INSTALLED_APPS",
            "READ_LGE_SDX",
            "READ_NOTIFICATIONS",
            "SEARCH",
            "WRITE_SETTINGS",
            "WRITE_NOTIFICATION_ALERT",
            "CONTROL_POWER",
            "READ_CURRENT_CHANNEL",
            "READ_RUNNING_APPS",
            "READ_UPDATE_INFO",
            "UPDATE_FROM_REMOTE_APP",
            "READ_LGE_TV_INPUT_EVENTS",
            "READ_TV_CURRENT_TIME"
        ],
        "serial" : "2f930e2d2cfe083771f68e4fe7bb07",
        "vendorId" : "com.lge"
      }
    },
    "pairingType" : "PROMPT"
  },
  "type" : "register"
}
`;

// get the handshake string used for setting up the ws connection
var get_handshake = function(clientKey) {
    var key = clientKey;
    if (key === undefined) {
        console.log("First usage, let's pair with TV.");
        return hello_w_key;
    } else {
        console.log("Client key:" + key);
        return hello_w_key.replace("CLIENTKEYGOESHERE", key);
    }
};

// store the client key on disk so that we don't have to pair next time
let store_client_key = function(key) {
    console.log("Storing client key:" + key);
    saveSetting({"clientKey": key});
};

let setupClient = function()
{
    ws.onerror = function(event) {
        var error = event.data;
        isConnected = false;
        // failed to connect, set timer to retry in a few seconds
        console.log("Connect Error: " + error);
    };
    assert.notEqual(ws.url, null);
    ws.onopen = function(event) {
        console.log("LG TV Client Connected: ", ws.url);
        isConnected = true;
        handshaken = false;
        getSetting("options", function(options) {
            var hs = get_handshake(options.clientKey);
            console.log("Sending handshake...");
            ws_send(hs);
        });
    };

    ws.onclose = function(event) {
        console.log("LG TV disconnected");
        isConnected = false;
        eventemitter.emit("lgtv_ws_closed");
    };

    ws.onmessage = function(event) {
        var message = event.data;
        console.log("<--- received:", message);
        var json = JSON.parse(message);
        eventemitter.emit(json.id, json);
    };
};

let ws_send = function(str){
    if (!isConnected) {
        console.log("ws_send: not connected");
        return false;
    }

    if (typeof str !== "string") {
        console.log("ws_send: invalid command");
        return false;
    }

    if (isConnected) {
        console.log("---> Sending command:" + str);
        ws.send(str);
    }

    return isConnected;
};

// send a command to the TV after having established a paired connection
var command_count = 0;

var send_command = function(prefix, msgtype, uri, payload, fn) {
    command_count++;
    var msg = '{"id":"' + prefix + command_count + '","type":"' + msgtype + '","uri":"' + uri + '"';
    if (typeof payload === 'string' && payload.length > 0) {
        msg += ',"payload":' + payload + "}";
    } else {
        msg += "}";
    }

    // if we were provided a callback, we register an event emitter listener for this.
    // note: there is a clear risk of memory leaks should we have a lot of outstanding
    // requests that never gets responses as the listeners are only cleared on response
    // or websocket close.
    try {
        if (ws_send(msg)) {
            if (typeof fn === "function") {
                eventemitter.on(prefix + command_count, function (message) {
                    fn(RESULT_OK, message);
                });
            }
        } else {
            throw "ws_send error";
        }
    } catch(err) {
        console.log("Error, not connected to TV:" + err.toString());
        if (typeof fn === "function") {
            fn(RESULT_ERROR, err);
        }
    }
};

open_connection = function(host, fn){
    console.log("connecting to ", host);
    try {
        // ws = new WebSocket(host, `echo-protocol`);
        ws = new WebSocket(host);
        setupClient();
        fn(RESULT_OK, {});
    } catch(error) {
        fn(RESULT_ERROR, error.toString());
    }
};

// verify that the provided host string contains ws protocol and port 3000,
// valid input examples:
//    lgsmarttv.lan
//    192.168.1.86
//    192.168.1.86:3000
//    ws://192.168.1.86:3000
//    ws://192.168.1.86
// if protocol or port is lacking, they are added
// returns either the corrected host string, or false if totally invalid hoststring

var _check_host_string = function(hoststr)
{
    if (hoststr.indexOf("ws://") !== 0) {
        hoststr = "ws://" + hoststr;
    }
    if (hoststr.indexOf(":3000") !== (hoststr.length - 5)) {
        hoststr += ":3000";
    }

    return hoststr;
};

// Connect to TV using either a host string (eg "192.168.1.213", "lgsmarttv.lan")
// or undefined for using the default "lgsmarttv.lan"
exports.connect = function(host, fn) {
    // if already connected, no need to connect again
    // (unless hostname is new, but this package is basically written for the usecase
    // of having a single TV on the LAN)
    if (isConnected && handshaken) {
        if (typeof fn === "function") {
            fn(RESULT_OK, {});
        }
        return;
    }

    // sanitize and set hostname
    if (host === undefined) {
        // no hostname specified, use default
        host = wsurl;
    } else if (typeof(host) !== "string") {
        // XXXXX error, argument error
        // throw something or at least give ample warning
        host = wsurl;
    }

    host = _check_host_string(host);
    
    if (host === false) {
        // provided host string is wrong, throw something
        // XXXX
    }
    
    // open websocket connection and perform handshake
    open_connection(host, function(success, msg){
        if (success) {
            // The connection was opened and the ws connection callback will automatically
            // send the handshake, but we here register the listener for the response to
            // that handshake; should be moved for code clarity
            eventemitter.on("register_0", function (message) {
                var key = message.payload["client-key"];
                if (typeof key === "undefined") {
                    if (typeof fn === "function") {
                        fn(RESULT_ERROR, "client key undefined");
                    }
                } else {
                    store_client_key(key);
                    handshaken = true;

                    if (typeof fn === "function") {
                        fn(RESULT_OK, {});
                    }
                }
            });
        } else {
            if (typeof fn === "function") {
                fn(RESULT_ERROR, msg);
            }
        }
    });
};

// show a float on the TV
exports.unsubscribe = function(id, fn) {
    var msg = '{"id":"' + id + '","type":"unsubscribe"}';
    try {
        if (typeof fn === "function") {
            eventemitter.once(prefix + command_count, function (message) {
                fn(RESULT_OK, message);
            });
        }

        if (!ws_send(msg))
        {
            throw "ws_send error";
        }

    } catch(err) {
        console.log("Error, not connected to TV.");
        if (typeof fn === "function") {
            fn(RESULT_ERROR, "not connected");
        }
    }
};

// show a toast on the TV
exports.show_toast = function(text, fn) {
    send_command("", "request", "ssap://system.notifications/createToast", '{"message": "MSG"}'.replace('MSG', text), fn);
};

exports.get_foreground_app_info = function(fn)
{
    send_command("test", "request", "ssap://com.webos.applicationManager/getForegroundAppInfo", null, fn);
};

exports.register_keyboard = function(fn)
{
    send_command("keyboard_", "subscribe", "ssap://com.webos.service.ime/registerRemoteKeyboard", null, fn);
};

// launch browser at URL; will open a new tab if already open
exports.open_browser_at = function(url, fn) {
    // must start with http:// or https://
    console.log("opening browser at:%s", url);
    var protocol = url.substring(0, 7).toLowerCase();
    if (protocol !== "http://" && protocol !== "https:/") {
        url = "http://" + url;
    }

    send_command("", "request", "ssap://system.launcher/open", JSON.stringify({target: url}), function(success, response){
        var ret = "";
        if (success) {
            ret = {sessionId: response.payload.sessionId};
        } else {
            ret = JSON.stringify(response);
        }

        fn(success, ret);
    });
};

exports.turn_off = function(fn) {
    send_command("", "request", "ssap://system/turnOff", null, fn);
};

exports.channellist = function(fn) {
    send_command("channels_", "request", "ssap://tv/getChannelList", null, function(success, resp) {
        if (success) {
            try {
                // extract channel list
                var channellistarray = resp.payload.channelList;
                var retlist = {channels : []};
                for (var i = channellistarray.length - 1; i >= 0; i--) {
                    var ch = {id: channellistarray[i].channelId,
                        name: channellistarray[i].channelName,
                        number: channellistarray[i].channelNumber};
                    // console.log(channellistarray[i]);
                    retlist.channels.push(ch);
                }

                fn(RESULT_OK, JSON.stringify(retlist));
            } catch(e) {
                console.log("Error:" + e);
                fn(RESULT_ERROR, resp);
            }
        } else {
            console.log("Error:" + resp);
            fn(RESULT_ERROR, resp);
        }
    });
};

var channel = function(fn) {
    send_command("channels_", "subscribe", "ssap://tv/getCurrentChannel", null, function(success, resp) {
        if (typeof fn === "function") {
            if (success) {
                if (resp.error) {
                    fn(RESULT_ERROR, "Error, probably not TV input right now");
                } else {
                    // return a subset of all information
                    fn(RESULT_OK, {id: resp.payload.channelId, // internal id, used for setting channel
                        name: resp.payload.channelName, // name as on TV, eg SVT
                        number: resp.payload.channelNumber}); // number on TV
                }
            } else {
                console.log("Error:" + resp);
                fn(RESULT_ERROR, "Error, could not get answer");
            }
        }
    });
};

// set the active channel; use channelId as from the channellist, such as eg 0_13_7_0_0_1307_0
var set_channel = function(channel, fn) {
    send_command("", "request", "ssap://tv/openChannel", JSON.stringify({channelId: channel}), function(success, resp){
        if (!success) {
            fn(success, {});
        } else {
            if (resp.type == "response") {
                fn(RESULT_OK, channel);
            } else if (resp.type == "error") {
                fn(RESULT_ERROR, resp.payload.errorText);
            } else {
                fn(RESULT_ERROR, "unknown error");
            }
        }
    });
};

// note: the TV does not consider 'live TV' as part of the external input list.
// This will just return eg HDMI_1, HDMI_2, SCART_1, etc.
var inputlist = function(fn) {
    send_command("input_", "request", "ssap://tv/getExternalInputList", null, function(success, resp) {
        if (typeof fn === "function") {
            if (success && resp.payload.devices !== undefined) {
                try {
                    // extract a nice and simple inputlist
                    var devs = resp.payload.devices;
                    var ret = {};
                    for (var i = devs.length - 1; i >= 0; i--) {
                        ret[devs[i].id] = devs[i].icon;
                    }

                    console.log(ret);
                    fn(RESULT_OK, ret);
                } catch(error) {
                    console.log("Error:" + error);
                    fn(RESULT_ERROR, error);
                }
            } else {
                console.log("Error reading input list or list is empty:" + resp);
                fn(RESULT_ERROR, resp);
            }
        }
    });
};

// set input source
exports.set_input = function(input, fn) {
    send_command("", "request", "ssap://tv/switchInput", JSON.stringify({inputId: input}), function(success, resp){
        if (!success) {
            fn(RESULT_ERROR, resp);
        } else {
            if (resp.payload.errorCode) {
                fn(RESULT_ERROR, resp.payload.errorText);
            } else {
                fn(RESULT_OK, input);
            }
        }
    });
};

// get program info
exports.get_program = function(fn) {
    send_command("program_", "subscribe", "ssap://tv/getChannelCurrentProgramInfo", null, function(success, resp){
        if (!success) {
            fn(RESULT_ERROR, "error getting program");
        } else {
            fn(RESULT_OK, resp.payload.programName);
        }
    });
};

// get system info
exports.system_info = function(fn) {
    send_command("sysinfo_", "request", "ssap://system/getSystemInfo", null, function(success, resp){
        if (!success) {
            fn(RESULT_ERROR, "error getting system info");
        } else {
            fn(RESULT_OK, resp.payload);
        }
    });
};

// set mute
exports.set_mute = function(setmute, fn) {
    if(typeof setmute !== "boolean") {
        fn(RESULT_ERROR, {reason: "mute must be boolean"});
    } else {
        send_command("", "request", "ssap://audio/setMute", JSON.stringify({mute: setmute}), fn);
    }
};

exports.muted = function(fn) {
    send_command("status_", "subscribe", "ssap://audio/getMute", null, function(success, response){
        if (success) {
            fn(RESULT_OK, response.payload.mute);
        } else {
            fn(RESULT_ERROR, response);
        }
    });
};

// get volume as 0..100 if not muted, if muted then volume is -1
exports.volume = function(fn) {
    send_command("volume_status_", "subscribe", "ssap://audio/getVolume", null, function(success, response){
        if (success) {
            if ("volumeStatus" in response.payload) {
                fn(RESULT_OK, response.payload.volumeStatus.volume);
            } else {
                fn(RESULT_OK, response.payload.volumeStatus.volume);
            }
        } else {
            fn(RESULT_ERROR, response);
        }
    });
};

exports.set_volume = function(volumelevel, fn) {
    if (typeof volumelevel !== "number") {
        fn(RESULT_ERROR, "volume must be a number");

    } else if(volumelevel < 0 || volumelevel > 100) {
        fn(RESULT_ERROR, "volume must be 0..100");

    } else {
        send_command("", "request", "ssap://audio/setVolume", JSON.stringify({volume: volumelevel}), fn);
    }
};

exports.input_media_play = function(fn) {
    send_command("", "request", "ssap://media.controls/play", null, fn);
};

exports.input_media_stop = function(fn) {
    send_command("", "request", "ssap://media.controls/stop", null, fn);
};

exports.input_media_pause = function(fn) {
    send_command("", "request", "ssap://media.controls/pause", null, fn);
};

exports.input_media_rewind = function(fn) {
    send_command("", "request", "ssap://media.controls/rewind", null, fn);
};

exports.input_media_forward = function(fn) {
    send_command("", "request", "ssap://media.controls/fastForward", null, fn);
};

exports.input_channel_up = function(fn) {
    send_command("", "request", "ssap://tv/channelUp", null, fn);
};

exports.input_channel_down = function(fn) {
    send_command("", "request", "ssap://tv/channelDown", null, fn);
};

exports.input_three_d_on = function(fn) {
    send_command("", "request", "ssap://com.webos.service.tv.display/set3DOn", null, fn);
};

exports.input_three_d_off = function(fn) {
    send_command("", "request", "ssap://com.webos.service.tv.display/set3DOff", null, fn);
};

exports.three_d_status = function(fn) {
    send_command("three_d_", "subscribe", "ssap://com.webos.service.tv.display/get3DStatus", null, fn);
};

exports.get_status = function(fn) {
    send_command("status_", "request", "ssap://audio/getStatus", null, fn);
    // send_command("status_", "subscribe", "ssap://audio/getStatus", null, fn);
};

exports.sw_info = function(fn) {
    send_command("sw_info_", "request", "ssap://com.webos.service.update/getCurrentSWInformation", null, fn);
};

exports.init_pointer_socket = function(fn) {
    send_command("pointer_", "request", "ssap://com.webos.service.networkinput/getPointerInputSocket", null, function(success, response) {
        if (success && response.type != "error")
        {
            console.log("socketPath: ", response.payload);
            pointerSocket = new WebSocket(response.payload.socketPath);
            pointerSocket.onmessage = function (event) { console.log(event.toString); };
            fn(RESULT_OK, pointerSocket);
        } else {
            fn(RESULT_ERROR, {});
        }
    });
};

exports.close_pointer_socket = function(fn) {
    if (pointerSocket)
    {
        pointerSocket.close();
    }
};

exports.pointer_button = function (keyName) {
    if (pointerSocket != null) {
        pointerSocket.send("type:button\n" + "name:" + keyName + "\n" + "\n");
    } else {
        console.log("pointerSocket is not connected");
    }
};

exports.pointer_move = function (dx, dy) {
    if (pointerSocket != null) {
        exports.pointerSocket.send("type:move\n" + "dx:" + dx + "\n" + "dy:" + dy + "\n" + "down:0\n" + "\n");
    } else {
        console.log("pointerSocket is not connected");
    }
};

exports.pointer_drag = function (dx, dy, drag) {
    if (pointerSocket != null) {
        pointerSocket.send("type:move\n" + "dx:" + dx + "\n" + "dy:" + dy + "\n" + "down:" + (drag ? 1 : 0) + "\n" + "\n");
    } else {
        console.log("pointerSocket is not connected");
    }
};

exports.scroll = function(dx, dy) {
    if (pointerSocket != null) {
        pointerSocket.send("type:scroll\n" + "dx:" + dx + "\n" + "dy:" + dy + "\n" + "\n");
    } else {
        console.log("pointerSocket is not connected");
    }
};

exports.click = function() {
    if (pointerSocket != null) {
        pointerSocket.send("type:click\n" + "\n");
    } else {
        console.log("pointerSocket is not connected");
    }
};

exports.services = function(fn) {
    send_command("services_", "request", "ssap://api/getServiceList", null, function(success, resp) {
        if (typeof fn === "function") {
            if (success) {
                try {
                    var services = resp.payload.services;
                    fn(RESULT_OK, resp.payload.services);
                } catch(e) {
                    console.log("Error:" + e);
                    fn(RESULT_ERROR, e);
                }
            } else {
                console.log("Error:" + resp);
                fn(RESULT_ERROR, resp);
            }
        }
    });
};

exports.apps = function(fn) {
    send_command("launcher_", "request", "ssap://com.webos.applicationManager/listLaunchPoints", null, function(success, response) {
        if (typeof fn === "function") {
            if (success) {
                try {
                    // extract a nice and simple list of apps
                    var applist = {};
                    var apps = response.payload.launchPoints;

                    for (var i = apps.length - 1; i >= 0; i--) {
                        applist[apps[i].id] = apps[i];
                    }

                    console.log("Returning applist:");
                    console.log(applist);
                    fn(RESULT_OK, applist);
                } catch(e) {
                    console.log("Error:" + e);
                    fn(RESULT_ERROR, e);
                }
            } else {
                console.log("Error reading apps list: ", resp);
                fn(RESULT_ERROR, resp);
            }
        }
    });
};

exports.open_app_with_payload = function(payload, fn) {
    send_command("", "request", "ssap://com.webos.applicationManager/launch", payload, null, fn);
};

exports.start_app = function(appid, fn) {
    send_command("", "request", "ssap://system.launcher/launch", JSON.stringify({id: appid}), function(success, resp){
        if (success) {
            if (resp.payload.errorCode) {
                fn(RESULT_ERROR, resp.payload.errorText);
            } else {
                fn(RESULT_OK, {sessionId : resp.payload.sessionId});
            }
        } else {
            fn(RESULT_ERROR, resp);
        }
    });
};

exports.close_app = function(appid, fn) {
    send_command("", "request", "ssap://system.launcher/close", JSON.stringify({id: appid}), function(success, resp){
        if (success) {
            if (resp.payload.errorCode) {
                // Note: This error response may come as a result of trying to close an app
                // that is not already open
                fn(RESULT_ERROR, resp.payload.errorText);
            } else {
                fn(RESULT_OK, {sessionId : resp.payload.sessionId});
            }
        } else {
            fn(RESULT_ERROR, resp);
        }
    });
};

exports.input_pause = function(fn) {
    send_command("pause_", "request", "ssap://media.controls/pause", null, fn);
};

exports.input_play = function(fn) {
    send_command("play_", "request", "ssap://media.controls/play", null, fn);
};

exports.input_stop = function(fn) {
    send_command("stop_", "request", "ssap://media.controls/stop", null, fn);
};

exports.input_volumeup = function(fn) {
    send_command("volumeup_", "request", "ssap://audio/volumeUp", null, fn);
};

exports.input_volumedown = function(fn) {
    send_command("volumedown_", "request", "ssap://audio/volumeDown", null, fn);
};

exports.replace_text = function(text, fn) {
    send_command("keyboard_", "request", "ssap://com.webos.service.ime/insertText", '{"text": "TEXT", "replace": true}'.replace('TEXT', text), fn);
};

exports.input_text = function(text, fn) {
    send_command("keyboard_", "request", "ssap://com.webos.service.ime/insertText", '{"text": "TEXT", "replace": false}'.replace('TEXT', text), fn);
};

exports.input_backspace = function(count, fn) {
    var c = count === undefined ? 1 : count;
    send_command("keyboard_", "request", "ssap://com.webos.service.ime/deleteCharacters", '{"count": COUNT}'.replace('COUNT', c.toString()), fn);
};

exports.input_enter = function(fn) {
    send_command("keyboard_", "request", "ssap://com.webos.service.ime/sendEnterKey", null, fn);
};

exports.open_youtube_at_id = function(video_id, fn) {
    var vurl = "http://www.youtube.com/tv?v=" + video_id;
    open_youtube_at_url(vurl, fn);
};

exports.open_youtube_at_url = function(url, fn) {
    var youtube_appid = "youtube.leanback.v4";
    var payload = {id: youtube_appid, params : {contentTarget: url}};
    send_command("", "request", "ssap://system.launcher/launch", JSON.stringify(payload), function(success, resp){
        if (success) {
            if (resp.payload.errorCode) {
                fn(RESULT_ERROR, resp.payload.errorText);
            } else {
                fn(RESULT_OK, {sessionId : resp.payload.sessionId});
            }
        } else {
            fn(RESULT_ERROR, resp);
        }
    });
};

exports.debugLog = function(err, response)
{
    if (response)
    {
        console.log(err, response);
    }
    else
    {
        console.log(err);
    }
};

exports.handleKeyboard = function(event)
{
    var x = event.which || event.keyCode;

    console.log("handleKeyboard: ", x);

    switch (x) {
        case 37:
            pointer_button("LEFT");
            break;
        case 38:
            pointer_button("UP");
            break;
        case 39:
            pointer_button("RIGHT");
            break;
        case 40:
            pointer_button("DOWN");
            break;
        case 13:
            pointer_button("ENTER");
            break;
        case 107:
            input_volumeup();
            break;
        case 109:
            input_volumedown();
            break;
        case 36: // home
            pointer_button("HOME");
            break;
        case 18: // alt+left arrow
            pointer_button("BACK");
            break;

            /*
            https://github.com/supersaiyanmode/PyWebOSTV/blob/master/pywebostv/connection.py
            pointer_button("DASH");
            pointer_button("INFO");
            pointer_button("MENU");

            pointer_button("1");
                ...
            pointer_button("9");
            pointer_button("0");

            pointer_button("ASTERISK");
            pointer_button("CC");
            pointer_button("EXIT");

            pointer_button("RED");
            pointer_button("GREEN");
            pointer_button("YELLOW");
            pointer_button("BLUE");

            pointer_button("MUTE");
            pointer_button("VOLUMEUP");
            pointer_button("VOLUMDOWN");
            pointer_button("CHANNELUP");
            pointer_button("CHANNELDOWN");
            */
    }
};

