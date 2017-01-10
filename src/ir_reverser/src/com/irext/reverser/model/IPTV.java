/**
 * Created by strawmanbobi
 * 2015-07-26
 */

package com.irext.reverser.model;

import java.util.List;

public class IPTV {

    private int brandID;
    private int mKookongBrandID;
    private List<Integer> mRemoteIDList;

    public IPTV(int brandID, int mKookongBrandID, List<Integer> mRemoteIDList) {
        this.brandID = brandID;
        this.mKookongBrandID = mKookongBrandID;
        this.mRemoteIDList = mRemoteIDList;
    }

    public IPTV() {

    }

    @Override
    public String toString() {
        return "IPTV{" +
                "brandID=" + brandID +
                ", mKookongBrandID=" + mKookongBrandID +
                ", mRemoteIDList=" + mRemoteIDList +
                '}';
    }

    public int getBrandID() {
        return brandID;
    }

    public void setBrandID(int brandID) {
        this.brandID = brandID;
    }

    public int getmKookongBrandID() {
        return mKookongBrandID;
    }

    public void setmKookongBrandID(int mKookongBrandID) {
        this.mKookongBrandID = mKookongBrandID;
    }

    public List<Integer> getmRemoteIDList() {
        return mRemoteIDList;
    }

    public void setmRemoteIDList(List<Integer> mRemoteIDList) {
        this.mRemoteIDList = mRemoteIDList;
    }
}
