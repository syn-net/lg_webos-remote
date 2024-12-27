`use strict`;

// import locales from '../_locales/en/messages.json';
// console.log(locales);

// const { 
  // utils,
// } = require('./utils');
import {
  // getEnv as env,
  isNode, 
  isBrowser, 
  isWebExtension,
  // getRuntime,
  LocalStorage,
  LocaleStore,
} from './utils.js';

function getStorageProxy(key, value) {
  console.log(`key=` + JSON.stringify(key));
  console.log(`value=` + JSON.stringify(value));
}

function setStorageProxy(key, value) {
  console.log(`key=` + JSON.stringify(key));
  console.log(`value=` + JSON.stringify(value));
}

function langProxy(messageStr) {
  console.log(`il8n: ${messageStr}`);
}

let chrome;

if(isBrowser() == false) {
  chrome = {
    i18n: { 
      getMessage: null,
    },
    storage: {
      local: {
        get: getStorageProxy,
        set: setStorageProxy,
      },
    },
  };
}

if(isNode() == true) {
  // use proxy functions; see @ngirl-utils/DataStore.js
  
  // import {DataStore} from '@ngirl/nom-utils'
  // localStorage = new DataStore({});
  // localStorage.set
  console.log(chrome.storage.local.set("options", {
    deviceIp: null,
  }));
  
  console.log(chrome.storage.local.get("options", (options) => {
    console.log(JSON.stringify(options));
  }));

  // localStorage.get
  // chrome.runtime.storage.local.get 
  // chrome.runtime.storage.local.set
  /// ??
}

if(isBrowser() == true) {
  // use native localStorage functions for these two 
  // proxy functions when inside browser env but outside of web extension env
  // localStorage.set
  // import {DataStore} from '@ngirl/nom-utils'
  // localStorage = DataStore;
  chrome = {
    i18n: {
      getMessage: null,
    },
    storage: {
      local: {
        get: null,
        set: null,
      },
    },
  };
  chrome.storage.local.set = window.localStorage.setItem;
  chrome.storage.local.get = window.localStorage.getItem;
  
  // chrome.storage.local.set = getStorageProxy;
  // chrome.storage.local.get;
  // chrome.storage.local.get
  // use i18n proxy (?)
  // chrome.i18n.getMessage = langProxy;
  // chrome.i18n.getMessage = function() {}
  
}

function lightPowerIcon(enabled) {
  console.log(`STUB: lightPowerIcon(enabled)`);
  //chrome.action.setBadgeText({text: "+"});
  //var color = enabled ? "green" : "red";
  //chrome.action.setBadgeBackgroundColor({color: color});
}

/*
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${JSON.stringify(oldValue)}", new value is "${JSON.stringify(newValue)}".`
    );
  }
});
*/

export 
function saveSetting(settings) {
  console.log(`saving...`);

    getSetting("options", function(options) {
        if (options == undefined)
        {
            options = {};
        }

        for (const [key, value] of Object.entries(settings))
        {
            options[key] = value;
        }
        
        window.localStorage.setItem("options", JSON.stringify(options));
          //   console.log(raw);
          //   return JSON.stringify(raw);
          //   // console.log('Value is set to ' + JSON.stringify(options));
          // });
        // localStorage.set
        // chrome.storage.local.set({"options": options}, function() {
        // window.localStorage.setItem("options", (raw) => {
        //   console.log(raw);
        //   return JSON.stringify(raw);
        //   // console.log('Value is set to ' + JSON.stringify(options));
        // });
    });
}

export 
function getSetting(key, fn) {
  const options = window.localStorage.getItem("options");
  const obj = JSON.stringify(options);
  // const obj = options;
  const res = fn(obj[key]);
  return res;
  // localStorage.get
  // chrome.storage.local.get("options", (options) => {
  window.localStorage.getItem("options", (options) => {
      console.log('Value currently is ' + JSON.stringify(options));
      fn(options[key]);
  });
}
