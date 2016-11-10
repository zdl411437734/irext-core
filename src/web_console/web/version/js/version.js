/**
 * Created by Strawmanbobi
 * 2015-11-17
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id, token;

var currentVersionType = '0';
var currentSubType = '0';
var currentPurpose = '0';
var currentLanguage = '0';
var currentStorage = '0';
var selectedVersion = null;

///////////////////////////// Initialization /////////////////////////////

$("#menu_toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$(document).ready(function() {
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    showMenu(id, token, "publish");

    initVersionTypeSelector();
    loadVersion();
    onVersionTypeChange();
});

function loadVersion() {
    var url = "/yuekong/int/list_versions?id="+id+"&token="+token;

    $('#version_table_container').empty();
    $('#version_table_container').append('<table id="version_table" data-row-style="rowStyle"></table>');

    $('#version_table').bootstrapTable({
        method: 'get',
        url: url,
        cache: false,
        height: 760,
        striped: true,
        pagination: true,
        pageSize: 50,
        pageList: [10, 25, 50, 100, 200],
        search: true,
        showColumns: true,
        showRefresh: false,
        minimumCountColumns: 2,
        clickToSelect: true,
        singleSelect: true,
        showExport: false,
        columns: [{
            field: '',
            checkbox: true
        }, {
            field: 'version_type',
            title: '类型',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'sub_type',
            title: '子类',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'dev_wlan_ver',
            title: '二进制文件1',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'dev_ble_ver',
            title: '二进制文件2',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'rem_ble_ver',
            title: '二进制文件3',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'update_time',
            title: '上传/发布日期',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }, {
            field: 'uploader',
            title: '上传/发布者',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }, {
            field: 'purpose',
            title: '发布目的',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }, {
            field: 'status',
            title: '状态',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }]
    }).on('check.bs.table', function (e, row) {
        onSelectVersion(row);
    }).on('uncheck.bs.table', function (e, row) {
        selectedVersion = null;
    }).on('load-success.bs.table', function (e, data) {
        var i = 0;
        console.log('size of data loaded = ' + data.length);
        for (i = 0; i < data.length; i++) {
            if(data[i].version_type == '0') {
                data[i].version_type = '底座';
            } else if (data[i].version_type == '1') {
                data[i].version_type = '遥控器';
            } else if (data[i].version_type == '2') {
                data[i].version_type = 'iOS预览';
            } else if (data[i].version_type == '3') {
                data[i].version_type = 'Android预览';
            }

            if(data[i].version_type == '遥控器' && data[i].sub_type == '0') {
                data[i].sub_type = '单体遥控器';
            } else if (data[i].version_type == '遥控器' && data[i].sub_type == '1') {
                data[i].sub_type = '套装遥控器';
            } else {
                data[i].sub_type = '-';
            }

            if(data[i].purpose == '0') {
                data[i].purpose = '用户升级';
            } else if (data[i].purpose == '1') {
                data[i].purpose = '售后升级';
            } else if (data[i].purpose == '2') {
                data[i].purpose = '工厂生产';
            }

            if(data[i].status == '1') {
                data[i].status = '已发布';
            } else if(data[i].status == '2') {
                data[i].status = '待验证';
            } else if(data[i].status == '3') {
                data[i].status = '通过';
            } else if(data[i].status == '4') {
                data[i].status = '不通过';
            }

            $('#version_table').bootstrapTable('updateRow', {
                index: i,
                row: {
                    version_type: data[i].version_type,
                    sub_type: data[i].sub_type,
                    status: data[i].status,
                    purpose: data[i].purpose
                }
            });
        }
    });
    selectedRemote = null;
}

function rowStyle(row, index) {
    var style = null;
    // console.log(JSON.stringify(row));
    if (row.status == '已发布') {
        style = {
            classes: 'default'
        };
    } else if (row.status == '待验证') {
        style = {
            classes: 'info'
        };
    } else if (row.status == '通过') {
        style = {
            classes: 'success'
        };
    } else if (row.status == '不通过') {
        style = {
            classes: 'danger'
        };
    } else {
        style = {
            classes: ''
        }
    }
    return style;
}

function initVersionTypeSelector () {
    var versionTypes = [
        {
            name: '底座固件',
            id: '0'
        },
        {
            name: '遥控器固件',
            id: '1'
        },
        {
            name: 'iOS客户端',
            id: '2'
        },
        {
            name: 'Android客户端',
            id: '3'
        }
    ];
    $.each(versionTypes, function (i, versionType) {
        $('#version_type').append($('<option>', {
            value: versionType.id,
            text : versionType.name
        }));
    });

    var subTypes = [
        {
            name: '单体遥控器',
            id: '0'
        },
        {
            name: '套装遥控器',
            id: '1'
        }
    ];
    $.each(subTypes, function (i, subType) {
        $('#sub_type').append($('<option>', {
            value: subType.id,
            text : subType.name
        }));
    });

    var purposes = [
        {
            name: '用户发布',
            id: '0'
        },
        {
            name: '售后发布',
            id: '1'
        },
        {
            name: '生产发布',
            id: '2'
        }
    ];
    $.each(purposes, function (i, purpose) {
        $('#purpose').append($('<option>', {
            value: purpose.id,
            text : purpose.name
        }));
    });

    var languages = [
        {
            name: '中文版',
            id: '0'
        },
        {
            name: '英文版',
            id: '1'
        }
    ];
    $.each(languages, function (i, language) {
        $('#language').append($('<option>', {
            value: language.id,
            text : language.name
        }));
    });

    var storages = [
        {
            name: 'EEPROM',
            id: '0'
        },
        {
            name: 'FLASH',
            id: '1'
        }
    ];
    $.each(storages, function (i, storage) {
        $('#storage').append($('<option>', {
            value: storage.id,
            text : storage.name
        }));
    });
}

///////////////////////////// Data process /////////////////////////////

function uploadVersion() {
    // form validation
    var remBleVer = "";
    var devBleVer = "";
    var devWlanVer = "";

    var ipaVer = "";
    var apkVer = "";

    var remBleFile = "";
    var devWlanFile = "";
    var devBleFile = "";

    var ipaFile = "";
    var apkFile = "";

    var language = "";
    var storage = "";

    remBleVer = $("#rem_ble_ver").val();
    devBleVer = $("#dev_ble_ver").val();
    devWlanVer = $("#dev_wlan_ver").val();

    ipaVer = $("#ipa_ver").val();
    apkVer = $("#apk_ver").val();

    remBleFile = $("#rem_ble_file").val();
    devWlanFile = $("#dev_wlan_file").val();
    devBleFile = $("#dev_ble_file").val();

    ipaFile = $("#ipa_file").val();
    apkFile = $("#apk_file").val();

    language = $("#language").val();
    storage = $("#storage").val();

    var liov = 0;
    var liod = 0;
    var versionNumber = "";

    if (null == currentVersionType ||
        null == currentPurpose) {
        popUpHintDialog('请选中版本类型和发布目的');
        return;
    }
    if (currentVersionType == '0') {
        // if this is a version of UCON Center
        if ("" == devBleVer || "" == devWlanVer) {
            popUpHintDialog('请填写UCON Center的无线和BLE二进制版本');
            return;
        }
        if ("" == devBleFile || "" == devWlanFile) {
            popUpHintDialog('请选择UCON Center的无线和BLE二进制文件');
            return;
        }
        if (-1 == devBleFile.indexOf("dev_ble") || -1 == devWlanFile.indexOf("dev_wlan")) {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }

        liov = devBleFile.lastIndexOf('V');
        liod = devBleFile.lastIndexOf('.');
        if (-1 != liov && -1 != liod && liod > liov) {
            versionNumber = devBleFile.substring(liov, liod);
            if (versionNumber != devBleVer) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }

        liov = devWlanFile.lastIndexOf('V');
        liod = devWlanFile.lastIndexOf('.');
        if (-1 != liov && -1 != liod && liod > liov) {
            versionNumber = devWlanFile.substring(liov, liod);
            if (versionNumber != devWlanVer) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }
    } else if (currentVersionType == '1') {
        // if this is a version of UCON Remote
        if ("" == remBleVer) {
            popUpHintDialog('请填写UCON Remote的BLE二进制版本');
            return;
        }
        if ("" == remBleFile) {
            popUpHintDialog('请选择UCON Remote的BLE二进制文件');
            return;
        }
        if (currentSubType == '0') {
            if (-1 == remBleFile.indexOf("ucon_ble")) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else if (currentSubType == '1') {
            if (-1 == remBleFile.indexOf("rem_ble") ) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        }

        liov = remBleFile.lastIndexOf('V');
        liod = remBleFile.lastIndexOf('.');
        if (-1 != liov && -1 != liod && liod > liov) {
            versionNumber = remBleFile.substring(liov, liod);
            if (versionNumber != remBleVer) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }
    } else if (currentVersionType == '2') {
        if ("" == ipaVer) {
            popUpHintDialog('请填写UCON iOS APP的版本');
            return;
        }
        if ("" == ipaFile) {
            popUpHintDialog('请选择UCON iOS APP的预览文件');
            return;
        }

        liov = ipaFile.lastIndexOf('V');
        liod = ipaFile.lastIndexOf('.');
        if (-1 != liov && -1 != liod && liod > liov) {
            versionNumber = ipaFile.substring(liov, liod);
            if (versionNumber != ipaVer) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }
    } else if (currentVersionType == '3') {
        if ("" == apkVer) {
            popUpHintDialog('请填写UCON Android APP的版本');
            return;
        }
        if ("" == apkFile) {
            popUpHintDialog('请选择UCON Android APP的预览文件');
            return;
        }

        liov = apkFile.lastIndexOf('V');
        liod = apkFile.lastIndexOf('.');
        if (-1 != liov && -1 != liod && liod > liov) {
            versionNumber = apkFile.substring(liov, liod);
            if (versionNumber != apkVer) {
                popUpHintDialog('发布的文件名称格式可能有错误');
                return;
            }
        } else {
            popUpHintDialog('发布的文件名称格式可能有错误');
            return;
        }
    }

    if (currentPurpose == '0') {
        if ((remBleFile != "" && remBleFile.indexOf("bin") == -1) ||
            (devBleFile != "" && devBleFile.indexOf("bin") == -1) ||
            (devWlanFile != "" && devWlanFile.indexOf("bin") == -1) ||
            (ipaFile != "" && ipaFile.indexOf("ipa") == -1) ||
            (apkFile != "" && apkFile.indexOf("apk") == -1)) {
            popUpHintDialog('发布的文件格式可能有错误');
            return;
        }
    } else if (currentPurpose == '1') {
        if ((remBleFile != "" && remBleFile.indexOf("bin") == -1) ||
            (devBleFile != "" && devBleFile.indexOf("bin") == -1) ||
            (devWlanFile != "" && devWlanFile.indexOf("bin") == -1)) {
            popUpHintDialog('发布的文件格式可能有错误');
            return;
        }
    } else if (currentPurpose == '2') {
        if ((remBleFile != "" && remBleFile.indexOf("hex") == -1) ||
            (devBleFile != "" && devBleFile.indexOf("hex") == -1) ||
            (devWlanFile != "" && devWlanFile.indexOf("bin") == -1)) {
            popUpHintDialog('发布的文件格式可能有错误');
            return;
        }
    }

    var remoteType = 0;
    if (1 == parseInt(language)) {
        remoteType += 0x01;
    }

    if (1 == parseInt(storage)) {
        remoteType += 0x04;
    }

    $("#remote_type").val(remoteType);
    doUploadVersion();
}

function doUploadVersion() {
    var form = $('#version_upload_form');
    form.attr('action', '/yuekong/int/create_version?id='+id+"&token="+token);
    //form.attr('method', 'post');
    //form.attr('encoding', 'multipart/form-data');
    //form.attr('enctype', 'multipart/form-data');

    form.submit();
    $("#create_version_dialog").modal('hide');
    $("#uploading_dialog").modal();
}

function deleteVersion() {
    if(null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    $.ajax({
        url: "/yuekong/int/delete_version?version_id="+selectedVersion.id+"&id="+id+"&token="+token,
        type: "POST",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#delete_confirm_dialog").modal("hide");
                popUpHintDialog("已成功删除版本组");
                loadVersion();
            } else {
                $("#delete_confirm_dialog").modal("hide");
                popUpHintDialog("删除版本组操作失败");
            }
        },
        error: function () {
            $("#delete_confirm_dialog").modal("hide");
            popUpHintDialog("删除版本组操作失败");
        }
    });
}

function fallbackVersion() {
    if(null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    var versionToFallback = selectedVersion;
    switch (versionToFallback.status) {
        case '已发布':
            versionToFallback.status = 1;
            break;
        case '待验证':
            versionToFallback.status = 2;
            break;
        case '通过':
            versionToFallback.status = 3;
            break;
        case '不通过':
            versionToFallback.status = 4;
            break;
        default:
            versionToFallback.status = 0;
            break;
    }
    $.ajax({
        url: "/yuekong/int/fallback_version?id="+id+"&token="+token,
        type: "POST",
        dataType: "json",
        data: versionToFallback,
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("已成功回退版本状态");
                loadRemoteList();
            } else {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("回退版本状态操作失败");
            }
        },
        error: function () {
            $("#verify_confirm_dialog").modal("hide");
            popUpHintDialog("回退遥控索引操作失败");
        }
    });
}

function verifyVersion() {
    if(null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    $.ajax({
        url: "/yuekong/int/verify_version?version_id="+selectedVersion.id+"&pass="+pass+"&id="+id+"&token="+token,
        type: "POST",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("已成功验证版本组");
                loadVersion();
            } else {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("验证版本组操作失败");
            }
        },
        error: function () {
            $("#delete_confirm_dialog").modal("hide");
            popUpHintDialog("验证版本组操作失败");
        }
    });
}

function publishVersion() {
    if(null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    if('通过' != selectedVersion.status) {
        popUpHintDialog('这个版本组没有被验证');
        return;
    }
    $.ajax({
        url: "/yuekong/int/publish_version?version_id="+selectedVersion.id+"&id="+id+"&token="+token,
        type: "POST",
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#verify_confirm_dialog").modal("hide");
                if ("iOS预览" == selectedVersion.version_type) {
                    popUpHintDialog("已成功发布版本组，由于本次发布的是iOS APP，请确认在APP STORE上通过审核并上线之后再发布相应版本，否则会引起用户异常");
                } else {
                    popUpHintDialog("已成功发布版本组");
                }

                loadVersion();
            } else {
                $("#verify_confirm_dialog").modal("hide");
                popUpHintDialog("发布版本组操作失败");
            }
        },
        error: function () {
            $("#verify_confirm_dialog").modal("hide");
            popUpHintDialog("发布版本组操作失败");
        }
    });
}

function downloadBin() {
    var wlanVer = "";
    var bleVer = "";
    var downloadURL = "http://yuekong-release.oss-cn-hangzhou.aliyuncs.com/";
    var bleDownload, wlanDownload;
    var fileSuffix;

    if(null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }

    if ("用户升级" == selectedVersion.purpose || "售后升级" == selectedVersion.purpose) {
        fileSuffix = ".bin";
    } else if ("工厂升级" == selectedVersion.purpose) {
        // only for ble images
        fileSuffix = ".hex";
    }


    if ("底座" == selectedVersion.version_type) {
        downloadURL += "UCON/";
        wlanVer = selectedVersion.dev_wlan_ver;
        bleVer = selectedVersion.dev_ble_ver;
        bleDownload = "dev_ble_" + bleVer + fileSuffix;
        wlanDownload = "dev_wlan_" + wlanVer + ".bin";
        downloadURL += bleDownload;
        window.open(
            downloadURL,
            '_blank'
        );
        downloadURL = "http://yuekong-release.oss-cn-hangzhou.aliyuncs.com/UCON/";
        downloadURL += wlanDownload;
        window.open(
            downloadURL,
            '_blank'
        );
    } else if ("遥控器" == selectedVersion.version_type) {
        downloadURL += "UCON/";
        bleVer = selectedVersion.rem_ble_ver;
        if ("单体遥控器" == selectedVersion.sub_type) {
            bleDownload = "ucon_ble_" + bleVer + fileSuffix;
            downloadURL += bleDownload;
            window.open(
                downloadURL,
                '_blank'
            );
        } else if ("套装遥控器" == selectedVersion.sub_type) {
            bleDownload = "rem_ble_" + bleVer + fileSuffix;
            downloadURL += bleDownload;
            window.open(
                downloadURL,
                '_blank'
            );
        }
    } else if ("iOS预览" == selectedVersion.version_type) {
        downloadURL += "iOS/";
        wlanVer = selectedVersion.dev_wlan_ver;
        wlanDownload = "UCON_iOS_" + wlanVer + ".ipa";
        downloadURL += wlanDownload;
        window.open(
            downloadURL,
            '_blank'
        );
    } else if ("Android预览" == selectedVersion.version_type) {
        downloadURL += "Android/";
        wlanVer = selectedVersion.dev_wlan_ver;
        wlanDownload = "UCON_Android_" + wlanVer + ".apk";
        downloadURL += wlanDownload;
        window.open(
            downloadURL,
            '_blank'
        );
    } else {
        console.log(selectedVersion.version_type);
        popUpHintDialog('版本名称错误');
    }
}

///////////////////////////// Event handler /////////////////////////////

function onCreateVersion() {
    currentVersionType = '0';
    currentSubType = '0';
    currentPurpose = '0';
    currentLanguage = '0';
    currentStorage = '0';

    $("#create_version_dialog").modal();
}

function onDeleteVersion() {
    var hintText = '';
    if (null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    hintText = '确认要删除' + selectedVersion.dev_wlan_ver + '/' + selectedVersion.dev_ble_ver + '/' + selectedVersion.rem_ble_ver + ' ' + selectedVersion.version_type + ' ' +
        selectedVersion.sub_type + ' ' + selectedVersion.purpose + ' 吗?';

    $("#delete_hint").empty();
    $("#delete_hint").append(hintText);
    $("#delete_confirm_dialog").modal();
}

function onFallbackVersion() {
    var hintText = '';
    if (null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    hintText = '确认要回退' + selectedVersion.dev_wlan_ver + '/' + selectedVersion.dev_ble_ver + '/' + selectedVersion.rem_ble_ver + ' ' + selectedVersion.version_type + ' ' +
        selectedVersion.sub_type + ' ' + selectedVersion.purpose + ' 吗?';

    $("#fallback_hint").empty();
    $("#fallback_hint").append(hintText);
    $("#fallback_confirm_dialog").modal();
}

function onVerifyVersion(isPass) {
    pass = isPass;
    var hintText = '';
    var passText = 0 == isPass ? '通过':'不通过';
    if (null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    hintText = '确认要 ' + passText + ' ' + selectedVersion.dev_wlan_ver + '/' + selectedVersion.dev_ble_ver + '/' + selectedVersion.rem_ble_ver + ' ' + selectedVersion.version_type + ' ' +
        selectedVersion.sub_type + ' ' + selectedVersion.purpose + ' 吗?';

    $("#verify_hint").empty();
    $("#verify_hint").append(hintText);
    $("#verify_confirm_dialog").modal();
}

function watchDetail() {
    var dev_wlan_hash = $("#dev_wlan_hash");
    var dev_ble_hash = $("#dev_ble_hash");
    var rem_ble_hash = $("#rem_ble_hash");
    var comment = $("#release_note");

    if (null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    dev_wlan_hash.empty();
    dev_wlan_hash.append("二进制文件1 Hash : " + selectedVersion.dev_wlan_hash);
    dev_ble_hash.empty();
    dev_ble_hash.append("二进制文件2 Hash : " + selectedVersion.dev_ble_hash);
    rem_ble_hash.empty();
    rem_ble_hash.append("二进制文件3 Hash : " + selectedVersion.rem_ble_hash);

    if (selectedVersion.version_type == '底座') {
        dev_wlan_hash.show();
        dev_ble_hash.show();
        rem_ble_hash.hide();
    } else if (selectedVersion.version_type == '遥控器') {
        dev_wlan_hash.hide();
        dev_ble_hash.hide();
        rem_ble_hash.show();
    } else if (selectedVersion.version_type == 'iOS预览' ||
        selectedVersion.version_type == 'Android预览') {
        dev_wlan_hash.show();
        dev_ble_hash.hide();
        rem_ble_hash.hide();
    }

    comment.val(selectedVersion.comment);

    $("#version_detail_dialog").modal();
}

function onPublishVersion() {
    var hintText = '';
    if (null == selectedVersion) {
        popUpHintDialog('请先选中一个版本组');
        return;
    }
    if("通过" != selectedVersion.status) {
        popUpHintDialog('这个版本组没有被验证');
        return;
    }
    if ("iOS预览" == selectedVersion.version_type) {
        popUpHintDialog("由于本次发布的是iOS APP，请确认在APP STORE上通过审核并上线之后再发布相应版本，否则会引起用户异常");
    }

    hintText = '确认要发布' + selectedVersion.dev_wlan_ver + '/' + selectedVersion.dev_ble_ver + '/' + selectedVersion.rem_ble_ver + ' ' + selectedVersion.version_type + ' ' +
        selectedVersion.sub_type + ' ' + selectedVersion.purpose + ' 吗?';

    $("#publish_hint").empty();
    $("#publish_hint").append(hintText);
    $("#publish_confirm_dialog").modal();
}

function onCloseUploadingDialog() {
    loadVersion();
    $("#uploading_dialog").modal("hide");
}

function onVersionTypeChange() {
    currentVersionType = $('#version_type').val();

    var subTypePanel = $("#sub_type_panel");
    var remoteTypePanel = $("#remote_type_panel");

    var dwvPanel = $("#dwv_panel");
    var dbvPanel = $("#dbv_panel");
    var rbvPanel = $("#rbv_panel");

    var ipaPanel = $("#ipa_panel");
    var apkPanel = $("#apk_panel");

    if (currentVersionType == '0') {
        subTypePanel.hide();
        remoteTypePanel.hide();

        dwvPanel.show();
        dbvPanel.show();
        rbvPanel.hide();
        ipaPanel.hide();
        apkPanel.hide();
    } else if (currentVersionType == '1') {
        subTypePanel.show();
        remoteTypePanel.show();

        dwvPanel.hide();
        dbvPanel.hide();
        rbvPanel.show();
        ipaPanel.hide();
        apkPanel.hide();
    } else if (currentVersionType == '2') {
        subTypePanel.hide();
        remoteTypePanel.hide();

        dwvPanel.hide();
        dbvPanel.hide();
        rbvPanel.hide();
        ipaPanel.show();
        apkPanel.hide();
    } else if (currentVersionType == '3') {
        subTypePanel.hide();
        remoteTypePanel.hide();

        dwvPanel.hide();
        dbvPanel.hide();
        rbvPanel.hide();
        ipaPanel.hide();
        apkPanel.show();
    }
}

function onSubtypeChange() {
    currentSubType = $('#sub_type').val();
}

function onPurposeChange() {
    currentPurpose = $('#purpose').val();
}

function onLanguageChange() {
    currentLanguage = $('#language').val();
}

function onStorageChange() {
    currentStorage = $('#storage').val();
}

function onSelectVersion(data) {
    selectedVersion = data;
}

function popUpHintDialog(hint) {
    $("#text_hint").empty();
    $("#text_hint").append(hint);
    $("#hint_dialog").modal();
}
