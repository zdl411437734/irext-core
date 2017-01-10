/**
 * Created by strawmanbobi
 * 2016-07-18
 */

package com.yuekong.sirius.ircoderobot.model;

public class Brand {

    private int mBrandID;
    private int mKookongBrandID;
    private int mCategoryID;
    private int mKookongCategoryID;
    private int mPriority;
    private String mBrandName;
    private String mBrandNameEn;
    private String mBrandNameTw;
    private String mProtector;

    public Brand(int mBrandID, int mKookongBrandID, int mCategoryID, String mProtector, String mBrandNameTw,
                 String mBrandNameEn, String mBrandName, int mPriority, int mKookongCategoryID) {
        this.mBrandID = mBrandID;
        this.mKookongBrandID = mKookongBrandID;
        this.mCategoryID = mCategoryID;
        this.mProtector = mProtector;
        this.mBrandNameTw = mBrandNameTw;
        this.mBrandNameEn = mBrandNameEn;
        this.mBrandName = mBrandName;
        this.mPriority = mPriority;
        this.mKookongCategoryID = mKookongCategoryID;
    }

    public Brand() {

    }

    public String toString() {
        return "Brand{" +
                "mBrandID=" + mBrandID +
                ", mKookongBrandID=" + mKookongBrandID +
                ", mCategoryID=" + mCategoryID +
                ", mKookongCategoryID=" + mKookongCategoryID +
                ", mPriority=" + mPriority +
                ", mBrandName='" + mBrandName + '\'' +
                ", mBrandNameEn='" + mBrandNameEn + '\'' +
                ", mBrandNameTw='" + mBrandNameTw + '\'' +
                ", mProtector='" + mProtector + '\'' +
                '}';
    }

    public int getmBrandID() {
        return mBrandID;
    }

    public void setmBrandID(int mBrandID) {
        this.mBrandID = mBrandID;
    }

    public int getmKookongBrandID() {
        return mKookongBrandID;
    }

    public void setmKookongBrandID(int mKookongBrandID) {
        this.mKookongBrandID = mKookongBrandID;
    }

    public int getmCategoryID() {
        return mCategoryID;
    }

    public void setmCategoryID(int mCategoryID) {
        this.mCategoryID = mCategoryID;
    }

    public int getmKookongCategoryID() {
        return mKookongCategoryID;
    }

    public void setmKookongCategoryID(int mKookongCategoryID) {
        this.mKookongCategoryID = mKookongCategoryID;
    }

    public int getmPriority() {
        return mPriority;
    }

    public void setmPriority(int mPriority) {
        this.mPriority = mPriority;
    }

    public String getmBrandName() {
        return mBrandName;
    }

    public void setmBrandName(String mBrandName) {
        this.mBrandName = mBrandName;
    }

    public String getmBrandNameEn() {
        return mBrandNameEn;
    }

    public void setmBrandNameEn(String mBrandNameEn) {
        this.mBrandNameEn = mBrandNameEn;
    }

    public String getmBrandNameTw() {
        return mBrandNameTw;
    }

    public void setmBrandNameTw(String mBrandNameTw) {
        this.mBrandNameTw = mBrandNameTw;
    }

    public String getmProtector() {
        return mProtector;
    }

    public void setmProtector(String mProtector) {
        this.mProtector = mProtector;
    }
}
