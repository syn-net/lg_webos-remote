`use strict`;

// https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md
// https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md#querydevice-info-example

function create_uri(hostname, port) {
  let uri = `${hostname}:${port}`;
  return(uri);
}

function send_command(url, opts = {}, args) {
  fetch(url, opts);
}

const DEFAULT_HOST_OPTS = {};
function device_info(uri, opts = DEFAULT_HOST_OPTS) {
  let uri = create_uri(uri);
  // ${hostname}:${port}/query?device-info
  const cmd = `$uri}}/query?device-info`;
  fetch(cmd, opts);
}

export {
  send_command,
};

//const devicePort = 8060;
//const deviceHost = `jeff-tv.home`;
//const inputUrl = `${deviceHost}:${devicePort}/query?device-info`;
