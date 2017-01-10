/**
 * Created by strawmanbobi
 * 2016-08-05
 */

package com.irext.reverser.model;

import java.util.List;

public class RemoteInstance {

    // actually this is the name of remote binary
    private int mRemoteTemplateID;
    private int mRemoteInstanceType;
    private List<KeyInstance> mKeyInstanceList;

    public RemoteInstance(int mTemplateID, int mRemoteInstanceType, List<KeyInstance> mKeyInstanceList) {
        this.mRemoteTemplateID = mTemplateID;
        this.mRemoteInstanceType = mRemoteInstanceType;
        this.mKeyInstanceList = mKeyInstanceList;
    }

    public RemoteInstance() {

    }

    @Override
    public String toString() {
        return "RemoteInstance{" +
                "mRemoteTemplateID=" + mRemoteTemplateID +
                ", mRemoteInstanceType=" + mRemoteInstanceType +
                ", mKeyInstanceList=" + mKeyInstanceList +
                '}';
    }

    public int getmRemoteTemplateID() {
        return mRemoteTemplateID;
    }

    public void setmRemoteTemplateID(int mRemoteTemplateID) {
        this.mRemoteTemplateID = mRemoteTemplateID;
    }

    public int getmRemoteInstanceType() {
        return mRemoteInstanceType;
    }

    public void setmRemoteInstanceType(int mRemoteInstanceType) {
        this.mRemoteInstanceType = mRemoteInstanceType;
    }

    public List<KeyInstance> getmKeyInstanceList() {
        return mKeyInstanceList;
    }

    public void setmKeyInstanceList(List<KeyInstance> mKeyInstanceList) {
        this.mKeyInstanceList = mKeyInstanceList;
    }
}
