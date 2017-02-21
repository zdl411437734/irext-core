/**
 * Created by Strawmanbobi
 * 2016-11-13
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";

var categoriesStated = false;

var colorClass = ["default", "primary", "success", "warning", "danger", "info"];

// global container var
var gCategories = [];
// 2-dimensions brand array
var gBrands = [];
// 1-dimension city array
var gCities = [];

$("#document").ready(function() {

});

// sign in
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
                    // navigateToPage(page, adminID, token);
                    window.location = "./" + page + "/index.html";
                }, 3000);
                localStorage.setItem(LS_KEY_ID, adminID);
                localStorage.setItem(LS_KEY_TOKEN, token);
            } else {
                toastr.error("登入失败，请确认密码是否正确");
            }
        },
        error: function() {
            toastr.error("登入失败，请确认密码是否正确");
        }
    });
}
// stat
function onStatCategories() {
    if (true == categoriesStated) {
        return;
    }
    console.debug("stat categories");
    statCategories();
}

function onStatBrands(categoryIndex) {
    var categoryID = 0;
    if (true == gBrands[categoryIndex].brandStated) {
        return;
    }
    categoryID = gCategories[categoryIndex].id;

    if (3 != categoryID) {
        statBrands(gCategories[categoryIndex].id, categoryIndex);
    } else {
        statCities(gCategories[categoryIndex].id, categoryIndex);
    }
}

function getStatInfo() {
    $.ajax({
        url: "/irext/stat/generic_count",
        type: "POST",
        dataType: 'json',
        data: {
            admin_id : id,
            token : token
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                refreshStatInfo(response.entity);
            } else {
                console.log("get remote instance count failed");
            }
        },
        error: function () {
            console.log("get remote instance count failed");
        }
    });
}

function statCategories() {
    $.ajax({
        url: "/irext/stat/stat_categories",
        type: "POST",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                gCategories = response.entity;
                refreshCategoryList();
            } else {
                console.log("stat categories failed");
            }
        },
        error: function () {
            console.log("stat categories failed");
        }
    });
}

function statBrands(categoryID, categoryIndex) {
    $.ajax({
        url: "/irext/stat/stat_brands",
        type: "POST",
        dataTpe: "JSON",
        data: {
            category_id: categoryID
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                gBrands[categoryIndex].brands = response.entity;
                // console.log("brands stat result = " + JSON.stringify(gBrands[categoryIndex].brands));
                refreshBrandList(categoryID, categoryIndex);
            } else {
                console.log("stat brands failed");
            }
        },
        error: function () {
            console.log("stat brands failed");
        }
    });
}

function statCities(categoryID, categoryIndex) {
    $.ajax({
        url: "/irext/stat/stat_cities",
        type: "POST",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                gCities.cities = response.entity;
                console.log("cities stat result = " + JSON.stringify(gCities.cities));
                refreshCityList(categoryID, categoryIndex);
            } else {
                console.log("stat cities failed");
            }
        },
        error: function () {
            console.log("stat cities failed");
        }
    });
}

function showStat() {
    $("#stat_dialog").modal();
}

function refreshStatInfo(statInfo) {
    var categoriesCountPanel = $("#categories_count");
    var brandsCountPanel = $("#brands_count");
    var remoteIndexesCountPanel = $("#remote_indexes_count");

    categoriesCountPanel.empty();
    categoriesCountPanel.append(statInfo.categories_count);
    brandsCountPanel.empty();
    brandsCountPanel.append(statInfo.brands_count);
    remoteIndexesCountPanel.empty();
    remoteIndexesCountPanel.append(statInfo.remote_indexes_count);
}

function refreshCategoryList() {
    var categoryContent = "";
    gBrands = new Array();
    for (var i = 0; i < gCategories.length; i++) {
        var category = gCategories[i];

        if (category.id == 11) {
            category.name = "機上盒";
        }
        var panelID = "category_" + category.id;
        var collapseID = "collapse" + category.id;
        var colorSpace = i % 6;
        var includingText = "";
        if (3 != category.id) {
            includingText = "个品牌";
        } else {
            includingText = "个省份";
        }
        // console.log(colorClass[colorSpace]);
        categoryContent +=
            "<div class='panel panel-default'>" +
            "<div class='panel-heading' role='tab' id='" + panelID + "'>" +
            "<h4 class='panel-title' style='text-align:left;'>" +
            "<a style='display: block; width: 100%; text-decoration: none;'" +
            "role='button' data-toggle='collapse' data-parent='#categories_panel'" +
            "href='#" + collapseID +"' onclick='onStatBrands(" + i + ")' " +
            "aria-expanded='true' aria-controls='" + collapseID + "'>" +
            category.name + " (" + category.brands_count + " " + includingText + ")" +
            "</a>" +
            "</h4>" +
            "</div>" +
            "<div id='" + collapseID + "' class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'>" +
            "<div class='panel-body' style='text-align:left;' id='brand_charts_" + category.id + "'>" +
            "正在加载..." +
            "</div>" +
            "</div>" +
            "</div>";
        gBrands[i] = new Array();
        gBrands[i].brandStated = false;
    }
    $("#categories_panel").html(categoryContent);
    categoriesStated = true;
}

function refreshBrandList(categoryID, categoryIndex) {
    // draw charts with highcharts
    // adjust the container of charts according to the number of brands in this category
    var containerHeight = gBrands[categoryIndex].brands.length * 30 + 200;
    console.log("container height = " + containerHeight);
    $("#brand_charts_" + categoryID).css("width", "100%");
    $("#brand_charts_" + categoryID).css("height", containerHeight + "px");
    $("#brand_charts_" + categoryID).css("padding", "0px");

    // generate brand names and supported remote index counts
    var brandNames = [];
    var remoteIndexCounts = [];
    for (var i = 0; i < gBrands[categoryIndex].brands.length; i++) {
        brandNames[i] = gBrands[categoryIndex].brands[i].name;
        remoteIndexCounts[i] = gBrands[categoryIndex].brands[i].remote_indexes_count;
    }

    $("#brand_charts_" + categoryID).highcharts({
        chart: {
            type: "bar",
            style: {
                fontFamily: '微软雅黑'
            },
            events: {
                load: function(event) {
                    // nothing to do
                }
            }
        },
        title: {
            text: gCategories[categoryIndex].name + "品牌分布"
        },
        xAxis: {
            categories: brandNames
        },
        yAxis: {
            title: {
                text: '支持型号数'
            }
        },
        series: [{
            name: '型号数',
            data: remoteIndexCounts,
            dataLabels: {
                enabled: true
            }
        }]
    });

    gBrands[categoryIndex].brandStated = true;
}

function refreshCityList(categoryID, categoryIndex) {
    // draw charts with highcharts
    // adjust the container of charts according to the number of brands in this category
    var containerHeight = gCities.cities.length * 30 + 200;
    console.log("container height = " + containerHeight);
    $("#brand_charts_" + categoryID).css("width", "100%");
    $("#brand_charts_" + categoryID).css("height", containerHeight + "px");
    $("#brand_charts_" + categoryID).css("padding", "0px");

    // generate brand names and supported remote index counts
    var provinceNames = [];
    var cityCounts = [];
    for (var i = 0; i < gCities.cities.length; i++) {
        provinceNames[i] = gCities.cities[i].name;
        cityCounts[i] = gCities.cities[i].city_count;
    }

    $("#brand_charts_" + categoryID).highcharts({
        chart: {
            type: "bar",
            style: {
                fontFamily: '微软雅黑'
            },
            events: {
                load: function(event) {
                    // nothing to do
                }
            }
        },
        title: {
            text: gCategories[categoryIndex].name + "地区分布"
        },
        xAxis: {
            categories: provinceNames
        },
        yAxis: {
            title: {
                text: '支持城市数'
            }
        },
        series: [{
            name: '城市数',
            data: cityCounts,
            dataLabels: {
                enabled: true
            }
        }]
    });

    gBrands[categoryIndex].brandStated = true;
}
