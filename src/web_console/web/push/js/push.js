/**
 * Created by Strawmanbobi
 * 2016-05-01
 */

var LS_KEY_ID = "user_name";
var LS_KEY_TOKEN = "token";
var id, token;

var filterMonth = "";

var selectedPushMessage = null;

///////////////////////////// Initialization /////////////////////////////

$("#menu_toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$(document).ready(function() {
    id = localStorage.getItem(LS_KEY_ID);
    token = localStorage.getItem(LS_KEY_TOKEN);
    showMenu(id, token, "push");

    var date = formatDate(new Date(), "yyyy-MM");
    $("#filter_date").val(date);

    $("#filter_date").datetimepicker({
        language:  'zh-CN',
        format: 'yyyy-mm',
        autoclose: true,
        todayHighlight: true,
        startView: 3,
        minView: 3,
        maxView: 3,
        showMeridian: 1
    }).on('changeDate', function(ev) {
        filterMonth = $("#filter_date").val();
        loadMessages();
    });

    loadMessages();

    $('#message_content').bind('input propertychange', function() {
        onInputMessage();
    });
});

function loadMessages() {
    filterMonth = $("#filter_date").val();
    var url = "/irext/push/list_push_messages?id="+id+"&token="+token+"&month="+filterMonth;

    $('#message_table_container').empty();
    $('#message_table_container').append('<table id="push_table" data-row-style="rowStyle"></table>');

    $('#push_table').bootstrapTable({
        method: 'get',
        url: url,
        cache: false,
        height: 500,
        striped: true,
        pagination: true,
        pageSize: 50,
        pageList: [10, 25, 50, 100, 200],
        search: true,
        showColumns: true,
        showRefresh: true,
        minimumCountColumns: 2,
        clickToSelect: true,
        singleSelect: true,
        showExport: false,
        columns: [{
            field: '',
            checkbox: true
        }, {
            field: 'from_peer',
            title: '发起者',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'dest_type',
            title: '推送方式',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'to_peer',
            title: '个人接收者',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'to_group',
            title: '组接收者',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'push_type',
            title: '推送类型',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, {
            field: 'message_show',
            title: '消息内容',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }, {
            field: 'update_time',
            title: '发布时间',
            align: 'left',
            valign: 'middle',
            sortable: true,
            clickToSelect: true
        }]
    }).on('check.bs.table', function (e, row) {
        onSelectPushMessage(row);
    }).on('uncheck.bs.table', function (e, row) {
        selectedPushMessage = null;
    }).on('load-success.bs.table', function (e, data) {
        var i = 0;
        console.log('size of data loaded = ' + data.length);
        for (i = 0; i < data.length; i++) {
            if(data[i].dest_type == '0') {
                data[i].dest_type = '广播推送';
            } else if (data[i].dest_type == '1') {
                data[i].dest_type = '单点推送';
            } else if (data[i].dest_type == '2') {
                data[i].dest_type = '组群推送';
            }

            if(data[i].push_type == '0') {
                data[i].push_type = '事件推送';
            } else if (data[i].push_type == '1') {
                data[i].push_type = '通知推送';
            } else {
                data[i].push_type = '-';
            }

            if(data[i].from_peer == 'data-center') {
                data[i].from_peer = '控制台';
            }

            if(data[i].message.length > 10) {
                data[i].message_show = data[i].message.substring(0, 9) + "...";
            } else {
                data[i].message_show = data[i].message;
            }

            $('#push_table').bootstrapTable('updateRow', {
                index: i,
                row: {
                    dest_type: data[i].dest_type,
                    push_type: data[i].push_type,
                    from_peer: data[i].from_peer,
                    message_show: data[i].message_show
                }
            });
        }
    });
}

function rowStyle(row, index) {
    var style = null;
    if (row.from_peer == '控制台') {
        style = {
            classes: 'success'
        };
    } else {
        style = {
            classes: ''
        }
    }
    return style;
}

function resetMessageInput() {
    $("#count_down_hint").html("还能再输入120字的内容");
    $("#message_content").val("");
}

///////////////////////////// Data process /////////////////////////////
function sendPushMessage() {
    var messageContent = $("#message_content").val();

    $.ajax({
        url: "/irext/push/broadcast?id="+id+"&token="+token,
        type: "POST",
        data: {
            from_peer : 'data-center',
            message : messageContent,
            push_type : '1'
        },
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                $("#push_message_dialog").modal("hide");
                popUpHintDialog("消息已经成功送出");
                resetMessageInput();
                loadMessages();
            } else {
                $("#push_message_dialog").modal("hide");
                resetMessageInput();
                popUpHintDialog("本条消息发送失败");
            }
        },
        error: function () {
            $("#push_message_dialog").modal("hide");
            resetMessageInput();
            popUpHintDialog("本条消息发送失败");
        }
    });
}

///////////////////////////// Event handler /////////////////////////////
function onInputMessage() {
    var messageContent = $("#message_content").val();
    $("#count_down_hint").html("还能再输入" + (120 - messageContent.length) + "字的内容");
}

function onSelectPushMessage(data) {
    selectedPushMessage = data;
}

function onSendPushMessage() {
    var messageContent = $("#message_content").val();
    if (0 == messageContent.length) {
        popUpHintDialog("请输入推送消息的内容");
        return;
    }
    $("#message_confirm_content").html(messageContent);
    $("#push_message_dialog").modal();
}

function onCheckDetail() {
    if (null == selectedPushMessage) {
        popUpHintDialog('请先选中一条消息');
        return;
    }
    $("#message_content_detail").val(selectedPushMessage.message);
    $("#message_detail_dialog").modal();
}

function popUpHintDialog(hint) {
    $("#text_hint").empty();
    $("#text_hint").append(hint);
    $("#hint_dialog").modal();
}
///////////////////////////// Utilities /////////////////////////////
