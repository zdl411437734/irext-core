/**
 * Created by Strawmanbobi on 2015-12-21.
 */

var id, token;
var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";

$(document).ready(function() {
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    showMenu(id, token, "doc");
});

$("#menu_toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

function navigation(anchor) {
    $.mobile.navigate("#"+anchor);
}