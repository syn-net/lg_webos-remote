function lightPowerIcon(enabled)
{
    chrome.action.setBadgeText({text: "+"});
    var color = enabled ? "green" : "red";
    chrome.action.setBadgeBackgroundColor({color: color});
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

function saveSetting(settings)
{
    getSetting("options", function(options) {
        if (options == undefined)
        {
            options = {};
        }

        for (const [key, value] of Object.entries(settings))
        {
            options[key] = value;
        }

        chrome.storage.local.set({"options": options}, function() {
            //console.log('Value is set to ' + JSON.stringify(options));
        });
    });
}

function getSetting(key, fn)
{
    chrome.storage.local.get("options", (options) => {
        //console.log('Value currently is ' + JSON.stringify(options));
        fn(options[key]);
    });
}

