/**
 * Created by strawmanbobi on 15-06-26
 */

/**
 * getContentType
 * @param url
 * @returns content type of image
 *
 * this function depends on angular-http
 */

function getContentType(url, callback) {
    $http({method: 'GET', url: url}).
        success(function (data, status, headers, config) {
            console.log("status = " + status);
            if(200 == status) {
                var contentType = headers('Content-Type');
                console.log("content-type = " + contentType);
                if(callback) {
                    callback(contentType);
                }
            }
        });
}