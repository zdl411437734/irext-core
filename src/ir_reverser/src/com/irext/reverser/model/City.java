/**
 * Created by strawmanbobi
 * 2016-07-18
 */

package com.irext.reverser.model;

public class City {

    private int mCityID;
    private String mCityCode;
    private String mCityName;
    private String mCityNameTw;
    private String mCityNameEn;
    private double mLongitude;
    private double mLatitude;

    public City(int mCityID, String mCityCode, String mCityName, String mCityNameTw, String mCityNameEn,
                double mLongitude, double mLatitude) {
        this.mCityID = mCityID;
        this.mCityCode = mCityCode;
        this.mCityName = mCityName;
        this.mCityNameTw = mCityNameTw;
        this.mCityNameEn = mCityNameEn;
        this.mLongitude = mLongitude;
        this.mLatitude = mLatitude;
    }

    public City() {

    }

    public String toString() {
        return "City{" +
                "mCityID=" + mCityID +
                ", mCityCode=" + mCityCode +
                ", mCityName='" + mCityName + '\'' +
                ", mCityNameTw='" + mCityNameTw + '\'' +
                ", mCityNameEn='" + mCityNameEn + '\'' +
                ", mLongitude=" + mLongitude +
                ", mLatitude=" + mLatitude +
                '}';
    }

    public int getmCityID() {
        return mCityID;
    }

    public void setmCityID(int mCityID) {
        this.mCityID = mCityID;
    }

    public String getmCityCode() {
        return mCityCode;
    }

    public void setmCityCode(String mCityCode) {
        this.mCityCode = mCityCode;
    }

    public String getmCityName() {
        return mCityName;
    }

    public void setmCityName(String mCityName) {
        this.mCityName = mCityName;
    }

    public String getmCityNameTw() {
        return mCityNameTw;
    }

    public void setmCityNameTw(String mCityNameTw) {
        this.mCityNameTw = mCityNameTw;
    }

    public String getmCityNameEn() {
        return mCityNameEn;
    }

    public void setmCityNameEn(String mCityNameEn) {
        this.mCityNameEn = mCityNameEn;
    }

    public double getmLongitude() {
        return mLongitude;
    }

    public void setmLongitude(double mLongitude) {
        this.mLongitude = mLongitude;
    }

    public double getmLatitude() {
        return mLatitude;
    }

    public void setmLatitude(double mLatitude) {
        this.mLatitude = mLatitude;
    }
}
