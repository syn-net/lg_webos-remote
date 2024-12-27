`use strict`;

import locales from '../_locales/en/messages.json';
console.log(locales);

// import exports from  './lgtv.js';
// const {
//   connect,
// } = exports;

import {
    getSetting,
    saveSetting,
} from './browser.js';

const target = {};
const handler = {};

// let getMessageProxy = new Proxy(target, handler);
const DEFAULT_OPTS = {
    fontSize: 16,
    bgColor: "CEE4D9",
    deviceIp: "",
};
// let chrome;
chrome.i18n = {};
chrome.i18n.getMessage = function(key) {
    const parsed = (key);
    
    if(locales && key) {
        return (parsed);
    }
}

function showInfo(text, delay)
{
    var status = document.getElementById("status");
    status.textContent = text;

    if (delay != undefined)
    {
        setTimeout(function() {
                status.textContent = "";
                }, delay);
    }
}

function updateOptions()
{
    saveSetting({"deviceIp": document.getElementById("deviceip").value,
                 "fontSize": document.getElementById("fontsize").value,
                 "bgColor": document.getElementById("background_color").value
                });
    showInfo(chrome.i18n.getMessage("options_saved"), 1000);
}

function connectionStatus(state)
{
     showInfo(chrome.i18n.getMessage("connection_to_device") + state);
}

function testConnection()
{
    deviceip = document.getElementById("deviceip").value;
    connectionStatus(connected() ? "OK" : "NOK!");
}

document.getElementById("saveButton").addEventListener("click", updateOptions);

function setDefault(options, key, defvalue)
{
    if (options[key] == undefined)
    {
        options[key] = defvalue;
    }
}

var restoreSettings = function(options)
{
    // set default
    setDefault(options, "fontSize", 16);
    setDefault(options, "bgColor", "CEE4D9");
    setDefault(options, "deviceIp", "");

    document.getElementById("background_color").style.backgroundColor = "#" + options.bgColor;
    document.getElementById("background_color").value = options.bgColor;
    document.getElementById("fontsize").value = options.fontSize;
    document.getElementById("deviceip").value = options.deviceIp;

    // if(typeof exports.connect === `function`) {
    {
        // let init = exports.get_status;
        let init = function() {
            console.log('init');
        };
        options.deviceIp = `wss://lg-tv.lan:3000`;
        console.log(`connecting to ${options.deviceIp}...`);
        open_connection(options.deviceIp, init);
    }
};

var setupUIMessages = function()
{
    document.getElementById("settingsTitle").textContent = chrome.i18n.getMessage("settings_title");
    document.getElementById("deviceIpLabel").textContent = chrome.i18n.getMessage("device_ip_label");
    document.getElementById("backgroundColorLabel").textContent = chrome.i18n.getMessage("background_color_label");
    document.getElementById("fontSizeLabel").textContent = chrome.i18n.getMessage("font_size_label");
    document.getElementById("saveButton").innerHTML = chrome.i18n.getMessage("save");
};

$(function()
{
    setupUIMessages();
    
    getSetting("options", function(options) {
        if (options === undefined)
        {
            options = {};
        }
        console.log(`restoring...`);
        restoreSettings(options);
    });
});

