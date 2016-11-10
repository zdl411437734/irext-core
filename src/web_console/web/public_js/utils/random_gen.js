/**
 * Created by strawmanbobi on 15-06-26
 */

function randomChar(l) {
    var x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    var tmp = "";
    for(var i = 0;i < l; i++)  {
        tmp += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return  tmp;
}

function rnd() {
    var today = new Date();
    var seed = today.getTime();
    seed = (seed * 9301 + 49297) % 233280;
    return seed / (233280.0);
}

function cr(number) {
    return Math.ceil(rnd() * number);
}