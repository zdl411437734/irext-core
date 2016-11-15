var pat = new RegExp("[^a-zA-Z0-9\_\u4e00-\u9fa5]","i");

function cleanString(str) {
    var cleanStr = str.replace(/[|&;$%@"<>()+,]/g, "");
    return cleanStr;
}

function validateIllegalChar(field_name, field_value) {
    if(pat.test(field_value) == true) {
        //alert(field_name + "只能由字母、数字或者汉字构成");
        return false;
    }
    return true;
}

function validateSame(field_name1, field_name2, field_value1, field_value2) {
    if(field_value1 != field_value2) {
        //alert(field_name1 + "和" + field_name2 + "必须一致");
        return false;
    }
    return true;
}

function setContent(str) {
    str = str.replace(/<\/?[^>]*>/g,'');
    str.value = str.replace(/[ | ]*\n/g,'\n');
    return str;
}

function isEmpty(theField)
{
    if(theField.length==0)
        return true;
    else
        return false;
}

function validateLength(field_name, field_value, min, max) {
    if(field_value.length < min || field_value.length > max) {
        //alert(field_name + "的长度必须在" + min + "和" + max + "之间");
        return false;
    }
    return true;
}

function validateNumeral(field_name, field_value, min, max) {
    if(isNumeral(field_value) == false) {
        //alert(field_name + "必须为数字");
        return false;
    }
    if(min) {
        if(field_value < min)
            return false;
    }
    if(max) {
        if(field_value > max)
            return false;
    }
    return true;
}

function validateEmail(field_name, field_value) {
    if(isEmail(field_value) == false) {
        //alert(field_name + "必须为电子邮件地址");
        return false;
    }
    return true;
}

function isNumeral(oNum) {
    if(!oNum)
        return false;
    var strP = /^\d+(\.\d+)?$/;
    if(!strP.test(oNum)) return false;
    try {
        if(parseFloat(oNum) != oNum)
            return false;
    } catch(ex) {
        return false;
    }
    return true;
}

function isEmail(strEmail) {
    if (strEmail.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
        return true;
    else
        return false;
}

// expect value :
// -2 : time1 must be earlier than time2
// -1 : time1 must be earlier then or equal to time2
// 0 : time1 must equal to time2
// 1 : time1 must be later than or equal to time2
// 2 : time1 must be later than time2

function compareTime(field_name_1, field_name_2, field_value1, field_value2, expect_value) {
    var ret = true;
    if(-2 == expect_value) {
        if(field_value1.localeCompare(field_value2) != -1) {
            //alert(field_name_1 + "应该早于" + field_name_2);
            ret = false;
        }
    } else if(-1 == expect_value) {
        if(field_value1.localeCompare(field_value2) == 1) {
            //alert(field_name_1 + "应该不晚于" + field_name_2);
            ret = false;
        }
    } else if(0 == expect_value) {
        if(field_value1.localeCompare(field_value2) != 0) {
            //alert(field_name_1 + "应该等于" + field_name_2);
            ret = false;
        }
    } else if(1 == expect_value) {
        if(field_value1.localeCompare(field_value2) == -1) {
            //alert(field_name_1 + "应该不早于" + field_name_2);
            ret = false;
        }
    } else if(2 == expect_value) {
        if(field_value1.localeCompare(field_value2) != 1) {
            //alert(field_name_1 + "应该晚于" + field_name_2);
            ret = false;
        }
    }
    return ret;
}

function getYesNo(i) {
    if(1 == i) {
        return "是";
    } else {
        return "否";
    }
}

Date.prototype.format = function(format)
{
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}