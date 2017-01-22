/*
 * Created by strawmanbobi
 * 2017-01-17
 *
 * brand model
 */

package com.irext.formatter.model;

public class Brand {

    private int id;
    private String name;
    private String updateTime;
    private int status;
    private int categoryID;
    private String categoryName;
    private int priority;
    private String nameEn;
    private String nameTw;
    private String contributor;

    public Brand(int id, String name, String updateTime, int status, int categoryID, String categoryName,
                 int priority, String nameEn, String nameTw, String contributor) {
        this.id = id;
        this.name = name;
        this.updateTime = updateTime;
        this.status = status;
        this.categoryID = categoryID;
        this.categoryName = categoryName;
        this.priority = priority;
        this.nameEn = nameEn;
        this.nameTw = nameTw;
        this.contributor = contributor;
    }

    public Brand() {

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
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

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameTw() {
        return nameTw;
    }

    public void setNameTw(String nameTw) {
        this.nameTw = nameTw;
    }

    public String getContributor() {
        return contributor;
    }

    public void setContributor(String contributor) {
        this.contributor = contributor;
    }
}
