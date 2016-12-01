/**
 * Created by Strawmanbobi
 * 2016-01-04
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id, token;

var categoriesStated = false;

var colorClass = ["default", "primary", "success", "warning", "danger", "info"];

// global container var
var gCategories = [];
// 2-dimensions brand array
var gBrands = [];
// 1-dimension city array
var gCities = [];

$("#menu_toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$(document).ready(function() {
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    showMenu(id, token, "stat");

    $("#main_tab a:first").tab("show");

    getRemoteInstanceCount();
    getDeviceCount();
    getRemoteCount();
});

///////////////////////////// Event functions /////////////////////////////
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

///////////////////////////// Data functions /////////////////////////////
function getRemoteInstanceCount() {
    $.ajax({
        url: "/irext/stat/generic_count?stat_type=0&id="+id+"&token="+token,
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
        url: "/irext/stat/generic_count?stat_type=1&id="+id+"&token="+token,
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
        url: "/irext/stat/generic_count?stat_type=2&id="+id+"&token="+token,
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

function statCategories() {
    $.ajax({
        url: "/irext/stat/stat_categories?id="+id+"&token="+token,
        type: "GET",
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
        url: "/irext/stat/stat_brands?id="+id+"&token="+token+"&category_id="+categoryID,
        type: "GET",
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
        url: "/irext/stat/stat_cities?id="+id+"&token="+token,
        type: "GET",
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