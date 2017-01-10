/**
 * Created by strawmanbobi
 * 2016-07-18
 */

package com.yuekong.sirius.ircoderobot.model;

public class Operator {

    private int mOperatorID;
    private int mOperatorType;
    private String mKookongOperatorID;
    private String mCityCode;
    private String mOperatorName;

    public Operator(int mOperatorID, int mOperatorType, String mKookongOperatorID, String mCityCode,
                    String mOperatorName) {
        this.mOperatorID = mOperatorID;
        this.mOperatorType = mOperatorType;
        this.mKookongOperatorID = mKookongOperatorID;
        this.mCityCode = mCityCode;
        this.mOperatorName = mOperatorName;
    }

    public Operator() {

    }

    @Override
    public String toString() {
        return "Operator{" +
                "mOperatorID=" + mOperatorID +
                ", mOperatorType=" + mOperatorType +
                ", mKookongOperatorID='" + mKookongOperatorID + '\'' +
                ", mCityCode='" + mCityCode + '\'' +
                ", mOperatorName='" + mOperatorName + '\'' +
                '}';
    }

    public int getmOperatorID() {
        return mOperatorID;
    }

    public void setmOperatorID(int mOperatorID) {
        this.mOperatorID = mOperatorID;
    }

    public int getmOperatorType() {
        return mOperatorType;
    }

    public void setmOperatorType(int mOperatorType) {
        this.mOperatorType = mOperatorType;
    }

    public String getmKookongOperatorID() {
        return mKookongOperatorID;
    }

    public void setmKookongOperatorID(String mKookongOperatorID) {
        this.mKookongOperatorID = mKookongOperatorID;
    }

    public String getmCityCode() {
        return mCityCode;
    }

    public void setmCityCode(String mCityCode) {
        this.mCityCode = mCityCode;
    }

    public String getmOperatorName() {
        return mOperatorName;
    }

    public void setmOperatorName(String mOperatorName) {
        this.mOperatorName = mOperatorName;
    }
}
