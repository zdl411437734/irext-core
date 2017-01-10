/**
 * Created by strawmanbobi
 * 2016-07-18
 */

package com.irext.reverser.model;

public class BrandCategoryRel {

    private int mKookongBrandID;
    private int mKookongCategoryID;

    public BrandCategoryRel(int mKookongBrandID, int mKookongCategoryID) {
        this.mKookongBrandID = mKookongBrandID;
        this.mKookongCategoryID = mKookongCategoryID;
    }

    public BrandCategoryRel() {

    }

    public String toString() {
        return "BrandCategoryRel{" +
                "mKookongBrandID=" + mKookongBrandID +
                ", mKookongCategoryID=" + mKookongCategoryID +
                '}';
    }

    public int getmKookongBrandID() {
        return mKookongBrandID;
    }

    public void setmKookongBrandID(int mKookongBrandID) {
        this.mKookongBrandID = mKookongBrandID;
    }

    public int getmKookongCategoryID() {
        return mKookongCategoryID;
    }

    public void setmKookongCategoryID(int mKookongCategoryID) {
        this.mKookongCategoryID = mKookongCategoryID;
    }
}
