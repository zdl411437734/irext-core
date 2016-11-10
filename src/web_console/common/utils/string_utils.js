/**
 * Created by strawmanbobi on 14-4-3.
 */

exports.stringTruncate = function (srcStr, maxLength) {
    if(null != srcStr && srcStr.length > maxLength) {
        return srcStr.substring(0,maxLength) + "...";
    }
    return srcStr;
};

exports.stringMask = function (srcStr, prefixLength, maskLength) {
    // auto mask string
    var retStr = "";
    var srcStrLength = srcStr.length;
    if(srcStrLength <= prefixLength) {
        return srcStr;
    }
    retStr = srcStr.substring(0, prefixLength);
    for(var i = 0; i < maskLength; i++) {
        retStr += "*";
    }
    if(srcStrLength <= prefixLength + maskLength) {
        return retStr;
    }
    retStr += srcStr.substring(prefixLength + maskLength);
    return retStr;
};

exports.verifyPhoneNumber = function (number){
    var a = /^((\(\d{3}\))|(\d{3}\-))?13\d{9}|14[57]\d{8}|15\d{9}|18\d{9}$/;
    if(number.length!=11||!number.match(a)) {
        return 0;
    } else {
        return 1;
    }
};

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};

String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};

String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};