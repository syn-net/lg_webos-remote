//importScripts("browser.js");
//importScripts("lgtv.js");

var openUrl = function(url)
{
    open_browser_at(url, function(err, msg){
        console.log(err, msg);
    });
};

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
          "id": "open_link_to_tv",
          "type" : "normal",
          "title": chrome.i18n.getMessage("open_link_on_tv"),
          "contexts": ["all"]
    });
});

var sendLinkToTV = function(e) {
    url = e.pageUrl;

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        url = tabs[0].url;
    });

    if (e.mediaType === "image") {
        url = encodeURI(e.srcUrl);
    }

    if (e.linkUrl) {
        // The user wants to buzz a link.
        url = e.linkUrl;
    }

    console.log("sendLinkToTV: ", url);

    if (!isConnected)
    {
        getSetting("options", function(options) {
            connect(options.deviceIp, function() { openUrl(url);});
        });
    }
    else
    {
        openUrl(url);
    }
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "open_link_to_tv") {
        //chrome.runtime.sendMessage({data: info});
        sendLinkToTV(info);
    }
});

function update()
{
    console.log("update");

    if (!isConnected)
    {
        console.log("connecting...");
        getSetting("options", function(options) {
            connect(options.deviceIp, get_status(function (res, msg) { lightPowerIcon(res); }));
        });
    }
    else
    {
        get_status(function (res, msg) { lightPowerIcon(res); });
    }
}

chrome.runtime.onStartup.addListener(function() {
        update();
        chrome.alarms.create({periodInMinutes: 1});
    }
);
chrome.alarms.onAlarm.addListener(update);

/*
// google analytics
var _AnalyticsCode = "UA-90494817-2";
const ANALYTICS_PATH = "https://www.google-analytics.com/collect";
async function postData(url = '', data = {}) {

  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: data
  });

}
*/

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("background: onMessage", message);
    sendResponse("ok");

    data = message;

    /*
    var gaParams = new URLSearchParams();
    cid = 555; // FIXME

    gaParams.append("v", 1);
    gaParams.append("tid", _AnalyticsCode);
    gaParams.append("cid", cid);

    gaParams.append("ec", "UX");
    gaParams.append("t", "pageview");
    gaParams.append("dp", data.page);
    gaParams.append("t", data.id);
    gaParams.append("pa", data.event);

    postData(ANALYTICS_PATH, gaParams);
    */
  }
);

