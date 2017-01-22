/*
 * Created by strawmanbobi
 * 2017-01-17
 *
 * remote_index model
 */

package com.irext.formatter.model;

public class RemoteIndex {

    private int id;
    private int categoryID;
    private String categoryName;
    private int brandID;
    private String brandName;
    private String cityCode;
    private String cityName;
    private String operatorID;
    private String operatorName;
    private String protocol;
    private String remote;
    private String remoteMap;
    private int status;
    private int subCategory;
    private int priority;
    private String remoteNumber;
    private String operatorNameTw;
    private String categoryNameTw;
    private String brandNameTw;
    private String cityNameTw;
    private String binaryMD5;
    private String contributor;
    private String updateTime;

    public RemoteIndex(int id, int categoryID, String categoryName, int brandID, String brandName, String cityCode,
                       String cityName, String operatorID, String operatorName, String protocol, String remote,
                       String remoteMap, int status, int subCategory, int priority, String remoteNumber,
                       String operatorNameTw, String categoryNameTw, String brandNameTw, String cityNameTw,
                       String binaryMD5, String contributor, String updateTime) {
        this.id = id;
        this.categoryID = categoryID;
        this.categoryName = categoryName;
        this.brandID = brandID;
        this.brandName = brandName;
        this.cityCode = cityCode;
        this.cityName = cityName;
        this.operatorID = operatorID;
        this.operatorName = operatorName;
        this.protocol = protocol;
        this.remote = remote;
        this.remoteMap = remoteMap;
        this.status = status;
        this.subCategory = subCategory;
        this.priority = priority;
        this.remoteNumber = remoteNumber;
        this.operatorNameTw = operatorNameTw;
        this.categoryNameTw = categoryNameTw;
        this.brandNameTw = brandNameTw;
        this.cityNameTw = cityNameTw;
        this.binaryMD5 = binaryMD5;
        this.contributor = contributor;
        this.updateTime = updateTime;
    }

    public RemoteIndex() {

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(int categoryID) {
        this.categoryID = categoryID;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public int getBrandID() {
        return brandID;
    }

    public void setBrandID(int brandID) {
        this.brandID = brandID;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getOperatorID() {
        return operatorID;
    }

    public void setOperatorID(String operatorID) {
        this.operatorID = operatorID;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getRemote() {
        return remote;
    }

    public void setRemote(String remote) {
        this.remote = remote;
    }

    public String getRemoteMap() {
        return remoteMap;
    }

    public void setRemoteMap(String remoteMap) {
        this.remoteMap = remoteMap;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(int subCategory) {
        this.subCategory = subCategory;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getRemoteNumber() {
        return remoteNumber;
    }

    public void setRemoteNumber(String remoteNumber) {
        this.remoteNumber = remoteNumber;
    }

    public String getOperatorNameTw() {
        return operatorNameTw;
    }

    public void setOperatorNameTw(String operatorNameTw) {
        this.operatorNameTw = operatorNameTw;
    }

    public String getCategoryNameTw() {
        return categoryNameTw;
    }

    public void setCategoryNameTw(String categoryNameTw) {
        this.categoryNameTw = categoryNameTw;
    }

    public String getBrandNameTw() {
        return brandNameTw;
    }

    public void setBrandNameTw(String brandNameTw) {
        this.brandNameTw = brandNameTw;
    }

    public String getCityNameTw() {
        return cityNameTw;
    }

    public void setCityNameTw(String cityNameTw) {
        this.cityNameTw = cityNameTw;
    }

    public String getBinaryMD5() {
        return binaryMD5;
    }

    public void setBinaryMD5(String binaryMD5) {
        this.binaryMD5 = binaryMD5;
    }

    public String getContributor() {
        return contributor;
    }

    public void setContributor(String contributor) {
        this.contributor = contributor;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }
}
