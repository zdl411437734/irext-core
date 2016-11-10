/**
 * Created by strawmanbobi on 15-06-26
 */

function stringTruncate(srcStr, maxLength) {
    if(null != srcStr && srcStr.length > maxLength) {
        return srcStr.substring(0,maxLength) + "...";
    }
    return srcStr;
}