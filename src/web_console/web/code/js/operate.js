/**
 * Created by strawmanbobi
 * 2017-03-27
 */

// web COM socket
var ws = null;
var transferSocketConnected = false;
var serialPortConnected = false;

// initialize transfer object
var binToTransfer = {
    category_id : 0,
    content : null,
    length : 0
};

var keyNames = [
    "POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "PLUS", "MINUS", "HOME", "BACK", "MENU"
];

var acPowers = ["ON", "OFF"];
var acTempBegin = 16;
var acModes = ["Cool", "Heat", "Auto", "Fan", "DEHUMID"];
var acSpeed = ["Low", "Medium", "High", "Auto"];
var acSwing = ["ON", "OFF"];
var acStatus = {
    power: 0,
    temp: 8,
    mode: 0,
    wind_dir: 0,
    wind_speed: 0
};

var decodedReceiverTimer = null;
var decodedValue = [];
var decodedReceiving = false;


var transferState = TRANSFER_STATE_NONE;

var BIN_TRANSFER_BYTE_MAX = 16;

function downloadBin() {
    var downloadURL = "";
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个索引');
        return;
    }
    downloadURL = '/irext/int/download_remote_index?remote_index_id='+selectedRemote.id+'&admin_id='+id+'&token='+token;

    if (null != client && client == 'console') {
        // directly download binary to remote via serial port
    } else {
        window.open(
            downloadURL,
            '_blank'
        );
    }
}

// binary transfer to IR decode chip sets
function onTransferBin() {
    if(null == selectedRemote) {
        popUpHintDialog('请先选中一个索引');
        return;
    }
    $('#binary_transfer_dialog').modal({
        backdrop: 'static',
        keyboard: false
    })
}

function onTransferTypeChanged() {
    // TODO:
}

function prepareTransfer() {
    if (false == transferSocketConnected) {
        ws = new WebSocket('ws://localhost:8301/');
        ws.binaryType = 'arraybuffer';

        ws.addEventListener('error', function () {
            onTransferSocketError();
        });

        ws.addEventListener('open', function () {
            onTransferSocketOpened();
        });

        ws.addEventListener('close', function () {
            onTransferSocketClosed();
        });

        ws.addEventListener('message', function (data) {
            onTransferSocketData(data);
        });
        transferSocketConnected = true;
    } else {
        popUpHintDialog('连接已经建立');
    }
}

function onTransferSocketError() {
    popUpHintDialog('当前的环境不支持 Web COM，请参考 <a href="http://https://github.com/strawmanbobi/web-com">' +
        'http://https://github.com/strawmanbobi/web-com</a> 获取更多信息');
    updateTransferState(TRANSFER_STATE_NONE, 0, 100);
}

function onTransferSocketOpened() {
    serialPortConnected = true;
}

function onTransferSocketClosed() {
    transferSocketConnected = false;
    popUpHintDialog("Web COM 已经关闭");
    updateTransferState(TRANSFER_STATE_NONE, 0, 100);
}

function onTransferSocketData(e) {
    // echo data from peer
    if (TRANSFER_STATE_BIN_FETCHED == transferState ||
        TRANSFER_STATE_BIN_ON_GOING == transferState) {
        var array = new Uint8Array(e.data);
        if (array[0] == 0x30) {
            onTransferResponse(array.slice(1));
        } else if (array[0] == 0x31) {
            onCommandResponse(array.slice(1));
        } else {
            // might be decode result
            console.log('error');
        }
    } else if (TRANSFER_STATE_BIN_DONE == transferState) {
        var array = new Uint16Array(e.data);
        // this is a part of the data chunk of the whole decoded values, concat this
        onDecoded(array);
    }
}

function onTransferResponse(data) {
    if (TRANSFER_STATE_BIN_FETCHED == transferState ||
        TRANSFER_STATE_BIN_ON_GOING == transferState) {
        // verify if the expected byte index equals '0'

        var index = parseInt(new TextDecoder("utf-8").decode(data));
        updateTransferState(TRANSFER_STATE_BIN_ON_GOING, index, binToTransfer.length);
        if (index >= binToTransfer.length) {
            updateTransferState(TRANSFER_STATE_BIN_DONE,index, binToTransfer.length);
        } else {
            sendExpectedData(index);
        }
    } else {
        console.log('invalid transfer state : ' + transferState);
    }
}

function onCommandResponse(data) {

}

function onDecoded(array) {
    if (decodedReceiverTimer) {
        clearTimeout(decodedReceiverTimer);
    }
    if (false == decodedReceiving) {
        // clear receiving buffer
        decodedValue = new Uint16Array(array);
    }
    decodedReceiving = true;
    // concat buffer
    decodedValue = concatTypedArrays(decodedValue, array);
    decodedReceiverTimer = setTimeout(function() {
        decodedReceiving = false;
        $('#dob_ir_wave_value').val(decodedValue);
    }, 200);
}

function fetchBinary() {
    var remoteToTransfer = selectedRemote;
    remoteToTransfer.admin_id = id;
    remoteToTransfer.token = token;
    $.ajax({
        url: '/irext/decode/prepare_transfering_remote_index',
        type: 'POST',
        dataType: 'json',
        data: remoteToTransfer,
        timeout: 20000,
        success: function (response) {
            if(response.status.code == 0) {
                onTransferBinFetched(response.entity);
            } else {
                popUpHintDialog('获取二进制文件失败');
            }
        },
        error: function () {
            popUpHintDialog('获取二进制文件失败');
        }
    });
}

function startTransfer() {
    if (!ws) {
        console.log('invalid transfer socket');
        return;
    }

    fetchBinary();
}

function startDoB() {
    /*
    if (TRANSFER_STATE_BIN_DONE != transferState) {
        popUpHintDialog("需要先下载二进制码");
        return;
    }
    */
    $('#binary_transfer_dialog').modal('hide');
    $('#dob_ir_wave_value').val('');
    resetKeyPressInfo();
    $('#dob_dialog').modal({
        backdrop: 'static',
        keyboard: false
    });
}

function quitDob() {
    $('#dob_dialog').modal('hide');
}

function sendExpectedData(index) {
    if (index < 0) {
        console.log('expected index error : ' + index + ', abort !!');
        return;
    }
    if (!ws) {
        console.log('invalid transfer socket');
        return;
    }
    var leftLength = binToTransfer.length - index;
    var lengthToSend = 0;
    if (leftLength < BIN_TRANSFER_BYTE_MAX) {
        lengthToSend = parseInt(leftLength);
    } else {
        lengthToSend = parseInt(BIN_TRANSFER_BYTE_MAX);
    }
    var arrayToSend = binToTransfer.content.slice(index, parseInt(index) + parseInt(lengthToSend));
    var binToSend = buildBinaryPacket(arrayToSend);
    ws.send(binToSend);
}

function cancelTransfer() {
    // close serial port by closing transfer socket
    if (ws) {
        ws.close();
    }
    serialPortConnected = false;
    updateTransferState(TRANSFER_STATE_NONE, 0, 100);
    $('#binary_transfer_dialog').modal('hide');
    binToTransfer = {
        category_id : 0,
        content : null,
        length : 0
    };
}

function onTransferBinFetched(btt) {
    var bin = _base64ToArrayBuffer(btt.bin);
    // prepare binary in RAM
    binToTransfer = {
        category_id : btt.category_id,
        // encode binary content into typed array
        content : new Uint8Array(bin),
        length : bin.byteLength
    };
    updateTransferState(TRANSFER_STATE_BIN_FETCHED, 0, 100);
    if (false == serialPortConnected) {
        popUpHintDialog("连接尚未建立，请先建立连接");
        return;
    }

    if (null == binToTransfer || null == binToTransfer.content || 0 == binToTransfer.length ||
        0 == binToTransfer.category_id) {
        popUpHintDialog("没有获取到有效的编码二进制文件，请重试");
        return;
    }

    // after remote binary is fetch, start binary data transfer by clicking 'start' button
    var binaryLengthData = buildBinaryLength(binToTransfer.length);
    if (null == binaryLengthData) {
        console.log('failed to parse binary length, abort !!');
        return;
    }
    var transferType = binToTransfer.category_id == CATEGORY_AC ? '2' : '1';
    var header = buildSummaryPacket(transferType + binaryLengthData);
    ws.send(header);
}

function updateTransferState(newState, progress, total) {
    var progressText = '';
    transferState = newState;
    switch (parseInt(newState)) {
        case TRANSFER_STATE_NONE:
            progressText = '空闲中';
            break;
        case TRANSFER_STATE_BIN_FETCHED:
            progressText = '二进制文件获得';
            break;
        case TRANSFER_STATE_BIN_ON_GOING:
            progressText = '发送中: ' + progress + '/' + total;
            break;
        case TRANSFER_STATE_BIN_DONE:
            progressText = '发送完成';
            break;
        default:
            console.log('transfer state error : ' + newState);
            break;
    }

    updateProgress(progress, total);
    $('#transfer_progress_desc').html(progressText);
}

function updateProgress(current, total) {
    var progress = $("#transfer_progress");
    progress.attr('aria-valuemax', total);
    progress.attr('data-transitiongoal', current);
    progress.progressbar();
}

function buildBinaryLength(lengthInfo) {
    try {
        var len = parseInt(lengthInfo);
        if (len >= 10000) {
            console.log('binary size exceeded');
            return null;
        } else if (len >= 1000 && len < 10000) {
            return lengthInfo;
        } else if (len >= 100 && len < 1000) {
            return "0" + lengthInfo;
        } else if (len >= 10 && len < 100) {
            return "00" + lengthInfo;
        } else if (len >= 0 && len < 10) {
            return "000" + lengthInfo;
        } else {
            console.log('binary size exceeded');
            return null;
        }
    } catch (err) {
        console.log('error occurred : ' + err);
        return null;
    }
}

function buildSummaryPacket(data) {
    if (isByteArray(data)) {
        return concatTypedArrays(new Uint8Array([0x30]), data);
    } else if (isString(data)) {
        return '0' + data;
    }
}

function buildBinaryPacket(data) {
    if (isByteArray(data)) {
        return concatTypedArrays(new Uint8Array([0x31]), data);
    } else if (isString(data)) {
        return '1' + data;
    } else {
        console.log('invalid type of bin to send : ' + typeof data + ', ' + data.constructor);
    }
}

function buildCommand(data) {
    if (isByteArray(data)) {
        return concatTypedArrays(new Uint8Array([0x32]), data);
    } else if (isString(data)) {
        return '2' + data;
    }
}

function onDoBClick(buttonID) {
     if (TRANSFER_STATE_BIN_DONE != transferState) {
     popUpHintDialog('需要先下载二进制码');
     return;
     }
    currentControl.key_id = buttonID.substring(8);
    updateKeyPressInfo(currentControl.key_id);
    decodeOnBoard(currentControl);
}

function updateKeyPressInfo(buttonID) {
    $('#key_press').html(keyNames[parseInt(buttonID)]);

    if(1 == selectedRemote.category_id && binToTransfer.category_id == CATEGORY_AC) {
        $('#ac_status_power').html('AC POWER:' + acPowers[acStatus.power]);
        $('#ac_status_mode').html('AC MODE:' + acModes[acStatus.mode]);
        $('#ac_status_temp').html('AC TEMP:' + (16 + parseInt(acStatus.temp)));
        $('#ac_status_speed').html('WIND SPEED:' + acSpeed[acStatus.wind_speed]);
        $('#ac_status_swing').html('SWING:' + acSwing[acStatus.wind_dir]);
    } else if (2 == selectedRemote.category_id && binToTransfer.category_id != CATEGORY_AC) {
        $('#ac_status_power').html('');
        $('#ac_status_mode').html('');
        $('#ac_status_temp').html('');
        $('#ac_status_speed').html('');
        $('#ac_status_swing').html('');
    }
}

function resetKeyPressInfo() {
    $('#key_press').html('');
    $('#ac_status_power').html('');
    $('#ac_status_mode').html('');
    $('#ac_status_temp').html('');
    $('#ac_status_speed').html('');
    $('#ac_status_swing').html('');
}

function decodeOnBoard(control) {
    var command = '';
    if (!ws) {
        console.log('invalid command socket');
        return;
    }

    var transferType = binToTransfer.category_id == CATEGORY_AC ? '2' : '1';

    if(1 == selectedRemote.category_id && binToTransfer.category_id == CATEGORY_AC) {
        // decode as AC
        acStatus = {
            power: '0',
            temp: '8',
            mode: '0',
            wind_dir: '0',
            wind_speed: '0'
        };
        control.ac_status = acStatus;
        var acFunction = '0';
        switch(control.key_id) {
            case '0':
                // power key --> change power
                acFunction = '1';
                break;
            case '1':
                // up key --> change wind speed
                acFunction = '5';
                break;
            case '2':
                // down key --> change wind dir
                acFunction = '6';
                break;
            case '4':
                // right key --> change mode
                acFunction = '2';
                break;
            case '5':
                // center key --> fix wind dir
                acFunction = '7';
                break;
            case '6':
                // plus key --> temp up
                acFunction = '3';
                break;
            case '7':
                // minus key --> temp down
                acFunction = '4';
                break;

            default:
                return;
        }
        command = buildCommand(transferType + acFunction + control.ac_status.power +
            control.ac_status.temp + control.ac_status.mode +
            control.ac_status.wind_dir + control.ac_status.wind_speed);
    } else {
        // decode as TV
        command = buildCommand(transferType + control.key_id);
    }

    ws.send(command);
}

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function ab2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => '0x' + ('00' + x.toString(16)).slice(-2)).join(',');
}

function concatTypedArrays(a, b) {
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

function isByteArray(obj) {
    return (typeof obj == 'object') && obj.constructor == Uint8Array;
}

function isString(obj) {
    return (typeof obj == 'string') && obj.constructor == String;
}