/**
 * Created by strawmanbobi
 * 2016-07-22
 */

package com.irext.reverser.model;

import java.util.List;

public class RemoteTemplate {

    private int mRemoteTemplateID;
    private int mFrequency;
    private int mType;
    private List<KeyTemplate> mKeyInstanceList;

    public RemoteTemplate(int mRemoteTemplateID, int mFrequency, int mType, List<KeyTemplate> mKeyInstanceList) {
        this.mRemoteTemplateID = mRemoteTemplateID;
        this.mFrequency = mFrequency;
        this.mType = mType;
        this.mKeyInstanceList = mKeyInstanceList;
    }

    public RemoteTemplate() {

    }

    @Override
    public String toString() {
        return "RemoteTemplate{" +
                "mRemoteTemplateID=" + mRemoteTemplateID +
                ", mFrequency=" + mFrequency +
                ", mType=" + mType +
                ", mKeyInstanceList=" + mKeyInstanceList +
                '}';
    }

    public int getmRemoteTemplateID() {
        return mRemoteTemplateID;
    }

    public void setmRemoteTemplateID(int mRemoteTemplateID) {
        this.mRemoteTemplateID = mRemoteTemplateID;
    }

    public int getmFrequency() {
        return mFrequency;
    }

    public void setmFrequency(int mFrequency) {
        this.mFrequency = mFrequency;
    }

    public int getmType() {
        return mType;
    }

    public void setmType(int mType) {
        this.mType = mType;
    }

    public List<KeyTemplate> getmKeyInstanceList() {
        return mKeyInstanceList;
    }

    public void setmKeyInstanceList(List<KeyTemplate> mKeyInstanceList) {
        this.mKeyInstanceList = mKeyInstanceList;
    }
}
