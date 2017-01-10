/**
 * Created by Strawmanbobi
 * 2016-07-18
 */

package com.yuekong.sirius.ircoderobot.model;

public class KeyTemplate {

    private int mKeyID;
    private int mKookongKeyID;
    private int mKeyHit;
    private String mKeyName;
    private String mKeyDisplayName;

    public KeyTemplate(int mKeyID, int mKookongKeyID, String mKeyName, String mKeyDisplayName) {
        this.mKeyID = mKeyID;
        this.mKookongKeyID = mKookongKeyID;
        this.mKeyName = mKeyName;
        this.mKeyDisplayName = mKeyDisplayName;
        this.mKeyHit = 0;
    }

    public KeyTemplate() {
        this.mKeyHit = 0;
    }

    @Override
    public String toString() {
        return "KeyTemplate{" +
                "mKeyID=" + mKeyID +
                ", mKookongKeyID=" + mKookongKeyID +
                ", mKeyName='" + mKeyName + '\'' +
                ", mKeyDisplayName='" + mKeyDisplayName + '\'' +
                '}';
    }

    public int getmKeyID() {
        return mKeyID;
    }

    public void setmKeyID(int mKeyID) {
        this.mKeyID = mKeyID;
    }

    public int getmKookongKeyID() {
        return mKookongKeyID;
    }

    public void setmKookongKeyID(int mKookongKeyID) {
        this.mKookongKeyID = mKookongKeyID;
    }

    public String getmKeyName() {
        return mKeyName;
    }

    public void setmKeyName(String mKeyName) {
        this.mKeyName = mKeyName;
    }

    public String getmKeyDisplayName() {
        return mKeyDisplayName;
    }

    public void setmKeyDisplayName(String mKeyDisplayName) {
        this.mKeyDisplayName = mKeyDisplayName;
    }

    public void clearKeyHit() {
        this.mKeyHit = 0;
    }

    public void countKeyHit() {
        this.mKeyHit++;
    }

    public int getmKeyHit() {
        return mKeyHit;
    }
}
