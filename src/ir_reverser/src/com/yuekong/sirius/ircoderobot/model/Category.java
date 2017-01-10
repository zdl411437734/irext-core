/**
 * Created by strawmanbobi
 * 2015-07-18
 */

package com.yuekong.sirius.ircoderobot.model;

public class Category {

    private int mCategoryID;
    private int mKookongCategoryID;
    private String mCategoryName;
    private String mCategoryNameEn;
    private String mCategoryNameTw;

    public Category(int mKookongCategoryID, String mCategoryName, String mCategoryNameEn,
                    String mCategoryNameTw) {
        this.mKookongCategoryID = mKookongCategoryID;
        this.mCategoryName = mCategoryName;
        this.mCategoryNameEn = mCategoryNameEn;
        this.mCategoryNameTw = mCategoryNameTw;
    }

    public Category() {

    }

    public String toString() {
        return "Category{" +
                "mCategoryID=" + mCategoryID +
                ", mKookongCategoryID=" + mKookongCategoryID +
                ", mCategoryName='" + mCategoryName + '\'' +
                ", mCategoryNameEn='" + mCategoryNameEn + '\'' +
                ", mCategoryNameTw='" + mCategoryNameTw + '\'' +
                '}';
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

    public String getmCategoryName() {
        return mCategoryName;
    }

    public void setmCategoryName(String mCategoryName) {
        this.mCategoryName = mCategoryName;
    }

    public String getmCategoryNameEn() {
        return mCategoryNameEn;
    }

    public void setmCategoryNameEn(String mCategoryNameEn) {
        this.mCategoryNameEn = mCategoryNameEn;
    }

    public String getmCategoryNameTw() {
        return mCategoryNameTw;
    }

    public void setmCategoryNameTw(String mCategoryNameTw) {
        this.mCategoryNameTw = mCategoryNameTw;
    }
}
