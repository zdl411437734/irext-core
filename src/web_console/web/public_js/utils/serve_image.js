/**
 * Created by strawmanbobi on 15-06-26
 */

function serveThumbnail(mediaServerURL, imageID, mode, width, height, autoOrient) {
    return mediaServerURL + imageID + (null != isExif ? "?exif/" : "?") + "imageView2/" + mode +
        (null != width ? "/w/" + width : "") +
        (null != height ? "/h/" + height : "");
}