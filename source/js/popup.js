var muteState;
var b3dstate;
var channelsMap = {};
var channels = [];
var favChannels = [];
var SUGGEST_PERIOD_DAYS = 7;

var getChannel = function()
{
    channel(function (err, c) {
        onChannel(c.id, c.name, c.number);
    });
};

var getChannelList = function()
{
    var date = new Date();
    var timestamp = date.getTime();

    channellist(function (err, c) {
        var json = JSON.parse(c);
        channels = json.channels;
        updateChannelList(sortFavorites(channels));
        document.getElementById("channelSelectDropdown").classList.toggle('disabled');
    });
};

var sortFavorites = function(items)
{
    var favs = [];
    var norms = [];

    for (var i in items)
    {
        items[i].favorite = checkFavorite(items[i].id);
        var favorite = items[i].favorite;

        if (favorite == true)
        {
            favs.push(items[i]);
        }
        else
        {
            norms.push(items[i]);
        }
    }

    // Merge both lists into one

    var sortedItems = norms.concat(favs);
    return sortedItems;
};

var checkFavorite = function(id)
{
    return (favChannels.indexOf(id) != -1);
};

var updateFavs = function(id, favorite)
{
    console.log(id, favorite);

    if (favorite)
    {
        gaq("updateFavs", "click");
        favChannels.push(id);
    }
    else
    {
        for( var i = 0; i < favChannels.length; i++)
        {
            if (favChannels[i] === id)
            {
                favChannels.splice(i, 1);
            }
        }
    }

    saveSetting({"favChannels": favChannels});
};

var addToFavorites = function(starElement, item)
{
    console.log(starElement, item);

    var favorite = !item.favorite;

    var star = "star_border";

    if (favorite)
    {
        star = "star";
    }

    starElement.innerHTML = star;

    setTimeout(function() {
        updateFavs(item.id, favorite);
        updateChannelList(sortFavorites(channels));
    }, 10);
};


var getVolume = function()
{
    volume(function (err, m) {
        onVolume(m);
    });
};

var onTest = function()
{
    window.open(chrome.runtime.getURL("magicremote.html"));
};

var onChannel = function(id, name, number)
{
    $("#programm").text("");
    $("#channelNumber").text(number);
    $("#channelName").text(name);
};

var initPointerSocket = function()
{
    init_pointer_socket(debugLog);
};

var onChannelChange = function(channel)
{
    console.log("onChannelChange: ", channel);
    var selector = document.getElementById("channelSelect");
    selector.style.display = 'none';
    set_channel(channel, debugLog);
};

var onInputChange = function(input)
{
    console.log("onInputChange: ", input);
    if (input === "LIVE_TV")
    {
        start_app("com.webos.app.livetv", debugLog);
    }
    else
    {
        set_input(input, debugLog);
    }
};

var onAppChange = function(app)
{
    console.log("onAppChange: ", app);
    start_app(app, debugLog);
};

var setStatus = function(statusText)
{
    if (statusText)
    {
        $("#status").text(statusText);
    }
};

var updateChannelList = function(items)
{
    var selector = $("#channelSelect");

    selector.empty();

    var autocompleteList = {};

    for (var item in items)
    {
        var li = document.createElement("li");
        var star = "star_border";

        if (items[item].favorite == true)
        {
            star = "star";
        }

        var starElement = document.createElement("i");
        starElement.innerHTML = star;
        starElement.classList.add("material-icons");

        starElement.onclick = (function(channel) { return function(e) { addToFavorites(this, channel); e.stopPropagation(); }; })(items[item]);

        var aElement = document.createElement("a");
        aElement.href = "#!";
        aElement.classList.add("collection-item");
        aElement.innerHTML = items[item].name;
        aElement.append(starElement);
        aElement.onclick = (function(channel) { return function() { onChannelChange(channel); };})(items[item].id);
        li.append(aElement);

        selector.prepend(li);
        autocompleteList[items[item].name] = null;
        channelsMap[items[item].name] = items[item];
    }

    $("#channelsSearch").autocomplete({data: autocompleteList, onAutocomplete: onChannelSearchComplete});

    var date = new Date();
    var timestamp = date.getTime();
};

var onChannelSearchComplete = function(val)
{
    gaq("channelSearch", "click");
    onChannelChange(channelsMap[val].id);
};

var onName = function(name)
{
    if ($("#devicename").text() == "")
    {
        $("#devicename").text(name);
    }
};

var on3DSupported = function(supported)
{
    b3dstate = false;
    if (supported)
    {
        $("#b3dmode").removeClass("disabled");
    }
};

var onMute = function(state)
{
    muteState = state;
    if (muteState)
    {
        $("#mute").addClass("red");
    }
    else
    {
        $("#mute").removeClass("red");
    }
};

var onPower = function(power)
{
    lightPowerIcon(power);

    if (power)
    {
        $("#power").removeClass("red");
    }
    else
    {
        $("#power").addClass("red");
    }
};

var onInputList = function(items)
{
    var selector = $("#inputSelect");

    for (var item in items)
    {
        var li = document.createElement("li");
        li.innerHTML = "<a href='#!' class='collection-item avatar'><div class='valign-wrapper'><img hspace='10' class='circle' height='32px' src='" + items[item] + "'>" + item + "</div></a>";
        li.onclick = (function(input) { return function() { onInputChange(input); };})(item);
        selector.prepend(li);
    }

    var li1 = document.createElement("li");
    li1.innerHTML = "<a href='#!' class='collection-item avatar'><i class='material-icons black-text'>tv</i>Live TV</a>";
    li1.onclick = (function(input) { return function() { onInputChange(input); };})("LIVE_TV");
    selector.prepend(li1);

};

var onVolume = function(level)
{
    console.debug("onVolume: ", level);
    $("#volumeLevel").html(level);
};

var checkSettings = function(options)
{
    if (options === undefined || options.deviceIp === undefined || options.deviceIp == "")
    {
        chrome.runtime.openOptionsPage();
    }
};

var getInputList = function()
{
    inputlist(function (err, i) {
        onInputList(i);
    });
};

var getMuteStatus = function()
{
    muted(function (err, m) {
        onMute(m);
    });
};

var get3DStatus = function()
{
    three_d_status(function (err, m) {
        debugLog(err, m);
    });
};

var getApps = function()
{
    apps(function(err, a) {
        onApps(a);
    });
};

var onApps = function(items)
{
    var selector = $("#appSelect");

    for (var item in items)
    {
        var li = document.createElement("li");
        li.innerHTML = "<a href='#!' class='collection-item'><div class='valign-wrapper'><img hspace='10' class='circle' height='32px' src='" + items[item].icon + "'>" + items[item].title + "</div></a>";
        li.onclick = (function(app) { return function() { onAppChange(app); };})(item);
        selector.prepend(li);
    }
};

var getProgram = function()
{
    get_program(onProgram);
};

var getSystemInfo = function()
{
    system_info(function (err, info) {
        onName(info.modelName);
        on3DSupported(info.features["3d"]);
    });
};

var getForegoundAppInfo = function()
{
    get_foreground_app_info(debugLog);
};

var onProgram = function(err, program)
{
    if (program !== undefined)
    {
        var length = 30;
        var text = program;

        var channelName = $("#channelName").text;
        if (channelName.length + program.length  + 1 > length)
        {
            text = program.substring(0, length - channelName.length - 1 - 3) + "..." ;
        }

        $("#programm").text(text);
    }
    else
    {
        $("#programm").text();
    }
};

var getStatus = function()
{
    onPower(isConnected);
    getMuteStatus();
    get3DStatus();
    getInputList();
    getVolume();
    getChannel();
    getApps();
    getChannelList();
    getProgram();
    getSystemInfo();
    getForegoundAppInfo();
    initPointerSocket();
};

var onPowerClick = function()
{
    var powerStatus = !$("power").checked;
    turn_off();
};

var on3DClick = function()
{
    if (b3dstate)
    {
        b3dstate = false;
        input_three_d_off();
        $("#b3dmode").removeClass("red");
    }
    else
    {
        b3dstate = true;
        input_three_d_on();
        $("#b3dmode").addClass("red");
    }
};

var toggleMute = function()
{
    set_mute(!muteState, debugLog);
};

LgTvRemote = {
    init: function() {
        $("#volumeup").click(input_volumeup);
        $("#volumedown").click(input_volumedown);
        $("#channelup").click(input_channel_up);
        $("#channeldown").click(input_channel_down);
        $("#pause").click(input_media_pause);
        $("#play").click(input_media_play);
        $("#stop").click(input_media_stop);
        $("#previous").click(input_media_rewind);
        $("#next").click(input_media_forward);
        $("#b3dmode").click(on3DClick);
        $("#test").click(onTest);
        $("#power").click(onPowerClick);
        $("#mute").click(toggleMute);
        $("#rowup").click(function() { pointer_button("UP"); });
        $("#rowdown").click(function() { pointer_button("DOWN"); });
        $("#rowleft").click(function() { pointer_button("LEFT"); });
        $("#rowright").click(function() { pointer_button("RIGHT"); });
        $("#rowenter").click(function() { pointer_button("ENTER"); });
        $("#home").click(function() { pointer_button("HOME"); });
        $("#back").click(function() { pointer_button("BACK"); });
        $("#settings").click(function() { chrome.runtime.openOptionsPage(); });
        //$("#settings").click(function() { pointer_button("ASTERISK"); });
        $("#channelsSearch").change(onChannelSearchComplete);

        $("#red_button").click(function() { pointer_button("RED"); });
        $("#green_button").click(function() { pointer_button("GREEN"); });
        $("#yellow_button").click(function() { pointer_button("YELLOW"); });
        $("#blue_button").click(function() { pointer_button("BLUE"); });

        document.getElementById("inputDropdown").addEventListener("click", function() { gaq("inputSelect", "click"); });
        document.getElementById("appDropdown").addEventListener("click", function() { gaq("appSelect", "click"); });
        document.getElementById("channelSelectDropdown").addEventListener("click", function() { gaq("channelSelect", "click"); });

        $(document).keydown(handleKeyboard);
    }
};

var gaq = function(event, action)
{
    console.log("gaq: ", event, action);

    page = window.location.href;
    data = {event: event, action: action, page: page};

    try {
        chrome.runtime.sendMessage({data: data});
    } catch (error) {
        console.error(error);
    }
};

var onMagicRemote = function()
{
    window.open(chrome.runtime.getURL("magicremote.html"));
};

var setupUIMessages = function()
{
    document.getElementById("channelSearchLabel").innerHTML = chrome.i18n.getMessage("channel_search_label");
    document.getElementById("channelDropdown").textContent = chrome.i18n.getMessage("channel_list_label");
    document.getElementById("appDropdown").textContent = chrome.i18n.getMessage("app_list_label");
    document.getElementById("inputDropdown").textContent = chrome.i18n.getMessage("input_list_label");
};

$(function() {
    getSetting("options", function(options) {
        checkSettings(options);

        if (options.fontSize)
        {
            document.body.style.fontSize = options.fontSize + "px";
        }

        if (options.bgColor)
        {
            document.body.style.backgroundColor = "#" + options.bgColor;
        }

        if (options.favChannels)
        {
            favChannels = options.favChannels;
        }

        connect(options.deviceIp, getStatus);
    });

    LgTvRemote.init();

    document.getElementById("magicremote").addEventListener("click", onMagicRemote);
    $('.dropdown-trigger').dropdown({ hover: false, constrainWidth: false, coverTrigger: false, inDuration: 0, outDuration: 0, closeOnClick: false});

    setupUIMessages();
    gaq("pageview");
});

