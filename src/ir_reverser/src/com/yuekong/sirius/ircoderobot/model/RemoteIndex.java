/**
 * Created by Strawmanbobi
 * 2016-07-20
 */

package com.yuekong.sirius.ircoderobot.model;

public class RemoteIndex {

    private int mRemoteIndexID;
    private int mKookongRemoteIndexID;
    private int mFrequency;
    private int mCodeLength;
    private int mKookongCategoryID;
    private int mKookongBrandID;
    private int mCategoryID;
    private int mBrandID;
    private int mType;

    public RemoteIndex(int mRemoteIndexID, int mKookongRemoteIndexID, int mFrequency, int mCodeLength,
                       int mKookongCategoryID, int mKookongBrandID, int mCategoryID, int mBrandID, int mType) {
        this.mRemoteIndexID = mRemoteIndexID;
        this.mKookongRemoteIndexID = mKookongRemoteIndexID;
        this.mFrequency = mFrequency;
        this.mCodeLength = mCodeLength;
        this.mKookongCategoryID = mKookongCategoryID;
        this.mKookongBrandID = mKookongBrandID;
        this.mCategoryID = mCategoryID;
        this.mBrandID = mBrandID;
        this.mType = mType;
    }

    public RemoteIndex() {

    }

    @Override
    public String toString() {
        return "RemoteIndex{" +
                "mRemoteIndexID=" + mRemoteIndexID +
                ", mKookongRemoteIndexID=" + mKookongRemoteIndexID +
                ", mFrequency=" + mFrequency +
                ", mCodeLength=" + mCodeLength +
                ", mKookongCategoryID=" + mKookongCategoryID +
                ", mKookongBrandID=" + mKookongBrandID +
                ", mCategoryID=" + mCategoryID +
                ", mBrandID=" + mBrandID +
                ", mType = " + mType;
    }

    public int getmRemoteIndexID() {
        return mRemoteIndexID;
    }

    public void setmRemoteIndexID(int mRemoteIndexID) {
        this.mRemoteIndexID = mRemoteIndexID;
    }

    public int getmKookongRemoteIndexID() {
        return mKookongRemoteIndexID;
    }

    public void setmKookongRemoteIndexID(int mKookongRemoteIndexID) {
        this.mKookongRemoteIndexID = mKookongRemoteIndexID;
    }

    public int getmFrequency() {
        return mFrequency;
    }

    public void setmFrequency(int mFrequency) {
        this.mFrequency = mFrequency;
    }

    public int getmCodeLength() {
        return mCodeLength;
    }

    public void setmCodeLength(int mCodeLength) {
        this.mCodeLength = mCodeLength;
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

    public int getmType() {
        return mType;
    }

    public void setmType(int mType) {
        this.mType = mType;
    }
}
