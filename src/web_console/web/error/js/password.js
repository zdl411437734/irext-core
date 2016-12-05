/**
 * Created by Strawmanbobi
 * 2016-12-02
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";

$(document).ready(function() {
    var password = getParameter('password');
    var result = getParameter('result');
    var indFrame = $("#plain_password");
    var indContent = "";

    if (result == 1) {
        indContent = "修改密码成功，请牢记您的新密码：" + password;
    } else {
        indContent = "未能成功修改密码";
    }

    indFrame.empty();
    indFrame.html(indContent);

    localstorage.removeItem(LS_KEY_ID);
    localstorage.removeItem(LS_KEY_TOKEN);
});