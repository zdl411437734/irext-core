/**
 * Created by Strawmanbobi
 * 2016-11-13
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";

$("#document").ready(function() {

});

function signIn() {
    var userName = $("#user_name").val();
    var password = $("#password").val();
    if (null == userName || "" == userName || null == password || "" == password) {
        toastr.error("请填写用户账户和密码");
        return;
    }
    var pwHash = MD5(password);
    doSignIn(userName, pwHash);
}

function onChangePassword() {
    var userName = $("#user_name").val();
    if (null == userName || "" == userName) {
        toastr.error("请填写用户账户");
        return;
    }
    $("#changepw_confirm_dialog").modal();
}

function popUpHintDialog(hint) {
    $("#text_hint").empty();
    $("#text_hint").append(hint);
    $("#hint_dialog").modal();
}

function navigateToPage(page, id, token) {
    var form = $("<form method='post'></form>"),
        input;
    form.attr({"action" : "/irext/nav/nav_to_url"});

    input = $("<input type='hidden'>");
    input.attr({"name": "admin_id"});
    input.val(id);
    form.append(input);

    input = $("<input type='hidden'>");
    input.attr({"name": "token"});
    input.val(token);
    form.append(input);

    input = $("<input type='hidden'>");
    input.attr({"name": "page"});
    input.val(page);
    form.append(input);

    form.submit();
}

function changePassword() {
    var userName = $("#user_name").val();
    if (null == userName || "" == userName) {
        popUpHintDialog("请填写用户账户");
        return;
    }
    $.ajax({
        url: "/irext/certificate/change_pw",
        type: "POST",
        data: {
            user_name : userName,
            callback_url : window.location.hostname
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#changepw_confirm_dialog").modal('hide');
                popUpHintDialog("新密码已经成功发送到您的邮箱，请查看并确认");
            } else {
                $("#changepw_confirm_dialog").modal('hide');
                popUpHintDialog("申请密码修改失败，请确认您是合法人员，且邮箱地址无误");
            }
        },
        error: function () {
            $("#changepw_confirm_dialog").modal('hide');
            popUpHintDialog("申请密码修改失败，请确认您是合法人员，且邮箱地址无误");
        }
    });
}

function onSignIn() {
    $("#signin_dialog").modal();
}

function doSignIn(userName, password) {
    var token = "";
    var adminID = "";
    $.ajax({
        url: "/irext/certificate/admin_login",
        type: "POST",
        data: JSON.stringify({user_name: userName, password: password}),
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                token = response.entity.token;
                adminID = response.entity.id;
                toastr.success("登入成功，3秒后自动进入控制台");
                var permission = token.substring(token.indexOf(",") + 1);
                var index = null;
                var page = "";
                if (null != permission && permission != "") {
                    index = permission.substring(0, 1);
                }
                if (null == index) {
                    window.location = "./error/auth_error.html";
                } else {
                    page = "code";
                }
                setTimeout(function() {
                    navigateToPage(page, adminID, token);
                }, 3000);
                if($("#remember_me").is(":checked")) {
                    localStorage.setItem(LS_KEY_ID, adminID);
                    localStorage.setItem(LS_KEY_TOKEN, token);
                }
            } else {
                toastr.error("登入失败，请确认密码是否正确");
            }
        },
        error: function() {
            toastr.error("登入失败，请确认密码是否正确");
        }
    });
}