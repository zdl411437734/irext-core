/**
 * Created by Strawmanbobi
 * 2016-05-01.
 */

function onSignout() {
    $("#signout_confirm_dialog").modal();
}

function signout() {
    localStorage.removeItem(LS_KEY_ID);
    localStorage.removeItem(LS_KEY_TOKEN);
    window.location = "../index.html";
}

function showMenu(id, token, active) {
    $("#side_bar").html("<li class='sidebar-brand'>" +
            "<a href='#' onclick='gotoWelcome();'>" +
            "UCON 控制台" +
            "</a>" +
        "</li>" +
        "<li>" +
            "<a id='menu_stat' style='display: none;' href='#' onclick='gotoStat();'>统计</a>" +
        "</li>" +
        "<li>" +
            "<a id='menu_remote' style='display: none;' href='#' onclick='gotoRemote();'>家电控制码管理</a>" +
        "</li>" +
        "<li>" +
            "<a id='menu_publish' style='display: none;' href='#' onclick='gotoVersion();'>版本发布</a>" +
        "</li>" +
        "<li>" +
            "<a id='menu_push' style='display: none;' href='#' onclick='gotoPush();'>消息推送</a>" +
        "</li>" +
        "<li>" +
            "<a id='menu_doc' style='display: none;' href='#' onclick='gotoDoc();'>开发者文档</a>" +
        "</li>" +
        "<li>" +
            "<hr>" +
        "</li>" +
        "<li>" +
            "<a id='sign_out' href='#' onclick='onSignout();'>退出</a>" +
        "</li>");

    // set sidebar-active to active item
    switch  (active) {
        case "stat":
            $("#menu_stat").attr("class", "sidebar-active");
            break;
        case "remote":
            $("#menu_remote").attr("class", "sidebar-active");
            break;
        case "publish":
            $("#menu_publish").attr("class", "sidebar-active");
            break;
        case "doc":
            $("#menu_doc").attr("class", "sidebar-active");
            break;
        case "push":
            $("#menu_push").attr("class", "sidebar-active");
            break;
    }
    var permissions = token.substring(token.indexOf(",") + 1);
    var menuOptions = permissions.split(",");
    if (null != menuOptions) {
        for (var i = 0; i < menuOptions.length; i++) {
            switch (parseInt(menuOptions[i])) {
                case 0:
                    $("#menu_remote").show();
                    break;
                case 1:
                    $("#menu_doc").show();
                    break;
                case 2:
                    $("#menu_publish").show();
                    break;
                case 3:
                    $("#menu_stat").show();
                    break;
                case 4:
                    $("#menu_push").show();
                    break;
                case 99:
                    $("#publish_button").show();
                    break;
                default:
                    break;
            }
        }
    }
}

function gotoWelcome() {
    window.location = "../welcome/index.html?id="+id+"&token="+token;
}

function gotoDoc() {
    window.location = "../doc/index.html?id="+id+"&token="+token;
}

function gotoRemote() {
    window.location = "../code/index.html?id="+id+"&token="+token;
}

function gotoVersion() {
    window.location = "../version/index.html?id="+id+"&token="+token;
}

function gotoStat() {
    window.location = "../stat/index.html?id="+id+"&token="+token;
}

function gotoPush() {
    window.location = "../push/index.html?id="+id+"&token="+token;
}

function hideSidebar() {
    $("#sidebar-wrapper").hide();
    $("#wrapper").toggleClass("toggled");
}
