`use strict`

import './browser.js';

import exports from  './lgtv.js';
const {
  connect,
  open_connection,
  get_status,
  sw_info,
  unsubscribe,
  show_toast,
  get_foreground_app_info,
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
  register_keyboard,
  open_browser_at,
} = exports;

let port = 3000;
let host = `ws://192.168.15.128:${port}`; // `ws://lg-tv.lan`
let hostTest = `ws://localhost:${port}`;  // `ws://localhost:3000`
let options = {
  deviceIp: host,
  // deviceIp: hostTest,
};

async function main() {
  // chrome.storage.local.set("options", options);
  await chrome.storage.local.get("options", options);

  await connect(options.deviceIp, get_status);
  await sw_info(get_status);
  // await show_toast(get_status);
}

await main();
process.exit(0);

