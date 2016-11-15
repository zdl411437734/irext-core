/**
 * Created by Strawmanbobi
 * 2016-01-04
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id, token;

$("#menu_toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$(document).ready(function() {
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    showMenu(id, token);

    $("#main_tab a:first").tab("show");

    // getRemoteInstanceCount();
    // getDeviceCount();
    // getRemoteCount();
});

///////////////////////////// Data functions /////////////////////////////
function getRemoteInstanceCount() {
    $.ajax({
        url: "/irext/int/generic_count?stat_type=0&id="+id+"&token="+token,
        type: "GET",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                refreshActiveRemoteInstance(response.entity);
            } else {
                console.log("get remote instance count failed");
            }
        },
        error: function () {
            console.log("get remote instance count failed");
        }
    });
}

function getDeviceCount() {
    $.ajax({
        url: "/irext/int/generic_count?stat_type=1&id="+id+"&token="+token,
        type: "GET",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                refreshActiveDeviceInstance(response.entity);
            } else {
                console.log("get device count failed");
            }
        },
        error: function () {
            console.log("get device count failed");
        }
    });
}

function getRemoteCount() {
    $.ajax({
        url: "/irext/int/generic_count?stat_type=2&id="+id+"&token="+token,
        type: "GET",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                refreshActiveRemote(response.entity);
            } else {
                console.log("get remote count failed");
            }
        },
        error: function () {
            console.log("get remote count failed");
        }
    });
}
///////////////////////////// UI functions /////////////////////////////
function refreshActiveRemoteInstance(count) {
    var remoteInstancePanel = $("#ucon_count");
    remoteInstancePanel.empty();
    remoteInstancePanel.append(count);
}

function refreshActiveDeviceInstance(count) {
    var deviceInstancePanel = $("#device_count");
    deviceInstancePanel.empty();
    deviceInstancePanel.append(count);
}

function refreshActiveRemote(count) {
    var remoteCountPanel = $("#remote_count");
    remoteCountPanel.empty();
    remoteCountPanel.append(count);
}