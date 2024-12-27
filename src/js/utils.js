`use strict`;

const DEFAULT_BOOL_PARSE_OPTS = {};
export function parseBoolean(key, value, opts = DEFAULT_BOOL_PARSE_OPTS) {
  return new Boolean(key);
}

// obtain env as an object with pre-initialized truthy values for env detection;
// this is perhaps more of a debug helper?
// rename to ? envDebug or such
export const getEnv = {
  node: isNode(),
  webextension: isWebExtension(),
  browser: isBrowser(),
};

export
function isNode() {
  return parseBoolean(typeof process !== 'undefined' && process.versions && process.versions.node);
}

export
function isBrowser() {
  return parseBoolean(typeof window !== 'undefined' && typeof window.document !== 'undefined');
}

export
function isWebExtension() {
  return parseBoolean(typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined');
}

// obtain env as string
export 
function getRuntime() {
  let result = `Unknown`;

  if(typeof navigator !== `undefined`) {
    result = navigator.userAgent;
  } else {
    result = typeof browser || typeof browser.runtime;
    
    if(getEnv.node) {
      result = `Node.js/${process.versions}`;
    } else if(getEnv.webextension) {
      result = `web extension`;
    } else if(getEnv.browser) {
      result = `browser`;
    }
  }

  return result;
}

// static allocated object store for DataStore classes
valuesmap = new Map();

export
class DataStore {
  DataStore() {

  }

  set = function(key, value) {
    let keyVal = value || null;
    if(key && keyVal) {
      valuesmap[key] = keyVal;
    }
  }
  get = function(key, value) {
    if(valuesmap[key] && value) {
      return valuesmap[key].value;
    }
    return null;
  }
};

export
class LocalStorage extends DataStore {
  LocalStorage() {}
};

export
class LocaleStore extends LocalStorage {
  LocaleStore() {}
  getMessage = function(msg, args) {
    return console.log(msg, args);
  }
}