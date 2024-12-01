`use strict`

//import {EventEmitter} from 'node:events';
import {EventEmitter} from './EventEmitter.js';

import './browser.js';

import exports from  './lgtv.js';
const {
  connect,
  open_connection,
  get_status,
  sw_info,
  input_media_play,
  input_media_stop,
  input_media_pause,
  input_media_rewind,
  input_media_forward,
  apps,
  start_app,
  close_app,
  input_pause,
  input_play,
  input_volumedown,
  input_volumeup,
  input_enter,
} = exports;

let port = 3000;
let host = `ws://192.168.15.128:` + port; // `ws://lg-tv.lan`
let hostTest = `ws://localhost:` + port; // `ws://lg-tv.lan`
let options = {
  deviceIp: host,
  // deviceIp: hostTest,
};

async function main() {
  chrome.storage.local.set("options", options);

  let err = function(key, value) {
    console.log(key, value);
  };

  await connect(options.deviceIp, exports.get_status);
  //chrome.storage.local.get("options");
  await sw_info(exports.get_status);

  chrome.storage.local.get("options", options);
}

await main();
process.exit(0);

