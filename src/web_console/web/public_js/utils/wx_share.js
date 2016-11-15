/**
 * Created by strawmanbobi on 15-06-26
 */

function createWeiXinShareImageURL(_iconImgPath) {
    var currentHost = window.location.host;
    return "http://" + currentHost + _iconImgPath;
}

function onWxJsBridgeReady() {
	var curPage = $.mobile.activePage;
    weixingFlag = 1;
	if(typeof title == "undefined") {
		title = typeof curPage.jqmData("title") == "undefined" ? 
			$(document).find("title").html() 
			: curPage.jqmData("title");
	}

	if(g_hideOption == "true" || g_hideOption == true) {
		//WeixinJSBridge.call('hideOptionMenu');
	}

    jQuery("#post-user").click(function() {
        console.log('post-user clicked');
        WeixinJSBridge.invoke('profile',{'username':'','scene':'57'}, function(res){
                console.log(res);
            }
        );
    });

	$("#sendAppMessage").on("click");
	WeixinJSBridge.on('menu:share:appmessage', function(argv) {
	    WeixinJSBridge.invoke('sendAppMessage', {
	        "appid": '',
	        "img_url": g_imgURL,
	        "img_width": "640",
	        "img_height": "640",
	        "link": typeof g_link == "undefined" ? window.location.href : g_link,
	        "desc": typeof g_desc == "undefined" ? title : g_desc,
	        "title": g_title
	    },
	    function(res) {
	        // do some thing
	        console.log(res.err_msg);
	    });
	});

	WeixinJSBridge.on('menu:share:timeline', function(argv) {
	    WeixinJSBridge.invoke('shareTimeline', {
	        "img_url": g_imgURL,
	        "img_width": "640",
	        "img_height": "640",
	        "link": typeof g_link == "undefined" ? window.location.href : g_link,
	        "desc": typeof g_desc == "undefined" ? title : g_desc,
	        "title": g_title + "\n" + g_desc
	    },
	    function(res) {});
	});

	var weiboContent = '';
	WeixinJSBridge.on('menu:share:weibo',
	function(argv) {
	    WeixinJSBridge.invoke('shareWeibo', {
	        "content": g_desc + g_link,
	        "url": g_link
	    },
	    function(res) {
	        // do some thing
	        console.log(res.err_msg);
	    });
	});
}

$(document).on("pageinit", ":jqmData(role='page')", function() {
    if(typeof WeixinJSBridge == "object" && WeixinJSBridge && WeixinJSBridge.invoke) {
	} else {
        if (document.addEventListener) {
		    document.addEventListener('WeixinJSBridgeReady', onWxJsBridgeReady, false);
		} else if (document.attachEvent) {
		    document.attachEvent('WeixinJSBridgeReady', onWxJsBridgeReady);
		    document.attachEvent('onWeixinJSBridgeReady', onWxJsBridgeReady);
		} else {
			console.log("no eventListener added");
		}
	}
});