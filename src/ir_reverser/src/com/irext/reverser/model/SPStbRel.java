/**
 * Created by Strawmanbobi
 * 2015-07-20
 */

package com.irext.reverser.model;

public class SPStbRel {

    private int mOperatorID;
    private String mCityCode;
    private int mKookongRemoteID;
    private int mPriority;

    public SPStbRel(int mOperatorID, String mCityCode, int mKookongRemoteID, int mPriority) {
        this.mOperatorID = mOperatorID;
        this.mCityCode = mCityCode;
        this.mKookongRemoteID = mKookongRemoteID;
        this.mPriority = mPriority;
    }

    public SPStbRel() {

    }

    @Override
    public String toString() {
        return "SPStbRel{" +
                "mOperatorID=" + mOperatorID +
                ", mCityCode=" + mCityCode +
                ", mKookongRemoteID=" + mKookongRemoteID +
                ", mPriority=" + mPriority +
                '}';
    }

    public int getmOperatorID() {
        return mOperatorID;
    }

    public void setmOperatorID(int mOperatorID) {
        this.mOperatorID = mOperatorID;
    }

    public String getmCityCode() {
        return mCityCode;
    }

    public void setmCityCode(String mCityCode) {
        this.mCityCode = mCityCode;
    }

    public int getmKookongRemoteID() {
        return mKookongRemoteID;
    }

    public void setmKookongRemoteID(int mKookongRemoteID) {
        this.mKookongRemoteID = mKookongRemoteID;
    }

    public int getmPriority() {
        return mPriority;
    }

    public void setmPriority(int mPriority) {
        this.mPriority = mPriority;
    }
}