/**
 * Created by Strawmanbobi
 * 2015-07-18
 */

package com.irext.reverser.model;

public class BrandRemoteRel {

    private int mKookongCategoryID;
    private int mKookongBrandID;
    private int mKookongRemoteID;
    private int mCategoryID;
    private int mBrandID;
    private int mRemoteID;
    private int mPriority;
    private String mCategoryName;
    private String mBrandName;
    private String mRemoteName;

    public BrandRemoteRel(int mKookongCategoryID, int mKookongBrandID, int mKookongRemoteID, int mCategoryID, int mBrandID, int mRemoteID, int mPriority, String mCategoryName, String mBrandName, String mRemoteName) {
        this.mKookongCategoryID = mKookongCategoryID;
        this.mKookongBrandID = mKookongBrandID;
        this.mKookongRemoteID = mKookongRemoteID;
        this.mCategoryID = mCategoryID;
        this.mBrandID = mBrandID;
        this.mRemoteID = mRemoteID;
        this.mPriority = mPriority;
        this.mCategoryName = mCategoryName;
        this.mBrandName = mBrandName;
        this.mRemoteName = mRemoteName;
    }

    public BrandRemoteRel() {

    }

    @Override
    public String toString() {
        return "BrandRemoteRel{" +
                "mKookongCategoryID=" + mKookongCategoryID +
                ", mKookongBrandID=" + mKookongBrandID +
                ", mKookongRemoteID=" + mKookongRemoteID +
                ", mCategoryID=" + mCategoryID +
                ", mBrandID=" + mBrandID +
                ", mRemoteID=" + mRemoteID +
                ", mPriority=" + mPriority +
                ", mCategoryName='" + mCategoryName + '\'' +
                ", mBrandName='" + mBrandName + '\'' +
                ", mRemoteName='" + mRemoteName + '\'' +
                '}';
    }

    public int getmKookongCategoryID() {
        return mKookongCategoryID;
    }

    public void setmKookongCategoryID(int mKookongCategoryID) {
        this.mKookongCategoryID = mKookongCategoryID;
    }

    public int getmKookongBrandID() {
        return mKookongBrandID;
    }

    public void setmKookongBrandID(int mKookongBrandID) {
        this.mKookongBrandID = mKookongBrandID;
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

    public int getmCategoryID() {
        return mCategoryID;
    }

    public void setmCategoryID(int mCategoryID) {
        this.mCategoryID = mCategoryID;
    }

    public int getmBrandID() {
        return mBrandID;
    }

    public void setmBrandID(int mBrandID) {
        this.mBrandID = mBrandID;
    }

    public String getmCategoryName() {
        return mCategoryName;
    }

    public void setmCategoryName(String mCategoryName) {
        this.mCategoryName = mCategoryName;
    }

    public String getmBrandName() {
        return mBrandName;
    }

    public void setmBrandName(String mBrandName) {
        this.mBrandName = mBrandName;
    }

    public int getmRemoteID() {
        return mRemoteID;
    }

    public void setmRemoteID(int mRemoteID) {
        this.mRemoteID = mRemoteID;
    }

    public String getmRemoteName() {
        return mRemoteName;
    }

    public void setmRemoteName(String mRemoteName) {
        this.mRemoteName = mRemoteName;
    }
}
