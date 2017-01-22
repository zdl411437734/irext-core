/*
 * Created by strawmanbobi
 * 2017-01-17
 *
 * remote_index model
 */

package com.irext.formatter.model;

public class IRProtocol {

    private int id;
    private String name;
    private int status;
    private int type;
    private String updateTime;
    private String contributor;
    private String bootCode;

    public IRProtocol(int id, String name, int status, int type, String updateTime,
                      String contributor, String bootCode) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.type = type;
        this.updateTime = updateTime;
        this.contributor = contributor;
        this.bootCode = bootCode;
    }

    public IRProtocol() {

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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    public String getContributor() {
        return contributor;
    }

    public void setContributor(String contributor) {
        this.contributor = contributor;
    }

    public String getBootCode() {
        return bootCode;
    }

    public void setBootCode(String bootCode) {
        this.bootCode = bootCode;
    }
}
