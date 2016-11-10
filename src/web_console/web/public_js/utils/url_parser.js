/**
 * Created by strawmanbobi on 15-06-26
 */

function truncate(str, len) {
    if(str.length > len)
        return str.substring(0, len) + "...";
    else
        return str;
}

function getQueryStringRegExp(name) {
    var reg = new RegExp("(^|\\?|&|)"+ name +"=([^&]*)(\\s|&|$|)", "i");
    if (reg.test(decodeURI(location.href))) return unescape(RegExp.$2.replace(/\+/g, " ")); return "";
}

function getParameter(name) {
    var rawParam = getQueryStringRegExp(name);
    var sharpPos = rawParam.indexOf('#');
    var p = rawParam;
    if (sharpPos >= 0) {
        p = p.substring(0, sharpPos);
    }
    return p;
}