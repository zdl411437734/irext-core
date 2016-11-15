/**
 * Created by Strawmanbobi
 * 2015-11-13
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id = "";
var token = "";
var client = null;

$("#document").ready(function() {
    client = getParameter('client');

    if (null != localStorage.getItem(LS_KEY_ID) &&
            null != localStorage.getItem(LS_KEY_TOKEN)) {
        // try auto-login
        toastr.info("尝试自动登入...");
        setTimeout(function() {
            verifyToken(localStorage.getItem(LS_KEY_ID), localStorage.getItem(LS_KEY_TOKEN));
        }, 2000);
    }
});

function signIn() {
    var userName = $("#user_name").val();
    var password = $("#password").val();
    if (null == userName || "" == userName || null == password || "" == password) {
        popUpHintDialog("请填写用户账户和密码");
        return;
    }
    var pwHash = MD5(password);
    doSignIn(userName, pwHash);
}

function onChangePassword() {
    var userName = $("#user_name").val();
    if (null == userName || "" == userName) {
        popUpHintDialog("请填写用户账户");
        return;
    }
    $("#changepw_confirm_dialog").modal();
}

function popUpHintDialog(hint) {
    $("#text_hint").empty();
    $("#text_hint").append(hint);
    $("#hint_dialog").modal();
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
            user_name : userName
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
                    /*
                    switch (parseInt(index)) {
                        case 0:
                            page = "./code/index.html";
                            break;
                        case 1:
                            page = "./doc/index.html";
                            break;
                        case 2:
                            page = "./version/index.html";
                            break;
                    }
                    */
                    page = "./welcome/index.html";
                    page += "?id="+adminID+"&token="+token;
                    
                    if (undefined != client && null != client && client == "console") {
                        page += "&client="+client;
                    }
                }
                setTimeout(function() {
                    window.location = page;
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

function verifyToken(id, token) {
    $.ajax({
        url: "/irext/certificate/token_verify",
        type: "POST",
        data: JSON.stringify({id: id, token: token}),
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
        success: function(response) {
            if(response.status.code == 0) {
                toastr.success("登入成功，3秒后自动进入控制台");
                // make console entry according to the content of token
                var permission = token.substring(token.indexOf(",") + 1);
                var index = null;
                var page = "";
                if (null != permission && permission != "") {
                    index = permission.substring(0, 1);
                }
                if (null == index) {
                    window.location = "./error/auth_error.html";
                } else {
                    /*
                    switch (parseInt(index)) {
                        case 0:
                            page = "./code/index.html";
                            break;
                        case 1:
                            page = "./doc/index.html";
                            break;
                        case 2:
                            page = "./version/index.html";
                            break;
                    }
                    */
                    page = "./welcome/index.html";
                    page += "?id="+id+"&token="+token;
                }
                setTimeout(function() {
                    window.location = page;
                }, 3000);
            } else {
                toastr.error("自动登入失败，请输入邮件地址和密码手动登入");
            }
        },
        error: function() {
            toastr.error("自动登入失败，请输入邮件地址和密码手动登入");
        }
    });
}

