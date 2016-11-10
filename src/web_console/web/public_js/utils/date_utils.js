/**
 * Created by strawmanbobi on 15-06-26
 */

function formatDate(date, fmt) {
    var o = {
        "M+" : date.getMonth() + 1,
        "d+" : date.getDate(),
        "h+" : date.getHours(),
        "m+" : date.getMinutes(),
        "s+" : date.getSeconds(),
        "q+" : Math.floor((date.getMonth() + 3) / 3),
        "S"  : date.getMilliseconds()
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

function getNextDay(dateString) {
    var nextDayStr;
    var nextMonthStr;
    var nextYearStr;
    var currentDate = new Date(dateString);
    var nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    var nextDay = nextDate.getDate();
    if(nextDay < 10) {
        nextDayStr = "0" + nextDay;
    } else {
        nextDayStr = nextDay;
    }
    var nextMonth = nextDate.getMonth() + 1;
    if(nextMonth < 10) {
        nextMonthStr = "0" + nextMonth;
    } else {
        nextMonthStr = nextMonth;
    }
    nextYearStr = nextDate.getFullYear();
    return nextYearStr + "-" + nextMonthStr + "-" + nextDayStr;
}

function getPreviousDay(dateString) {
    var lastDayStr;
    var lastMonthStr;
    var lastYearStr;
    var currentDate = new Date(dateString);
    var lastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    var lastDay = lastDate.getDate();
    if(lastDay < 10) {
        lastDayStr = "0" + lastDay;
    } else {
        lastDayStr = lastDay;
    }
    var lastMonth = lastDate.getMonth() + 1;
    if(lastMonth < 10) {
        lastMonthStr = "0" + lastMonth;
    } else {
        lastMonthStr = lastMonth;
    }
    lastYearStr = lastDate.getFullYear();
    return lastYearStr + "-" + lastMonthStr + "-" + lastDayStr;
}