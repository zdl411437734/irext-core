/**
 * Created by strawmanbobi
 * 2016-08-05
 */

package com.yuekong.sirius.ircoderobot.model;

public class KeyInstance {

    public static final int KEY_TYPE_GENERIC = 0;
    public static final int KEY_TYPE_RC5 = 1;

    private int mKeyTemplateID;
    private int mKeyType;
    private String mKeyValue;

    public KeyInstance(int mKeyTemplateID, int mKeyType, String mKeyValue) {
        this.mKeyTemplateID = mKeyTemplateID;
        this.mKeyType = mKeyType;
        this.mKeyValue = mKeyValue;
    }

    public KeyInstance() {

    }

    @Override
    public String toString() {
        return "KeyInstance{" +
                "mKeyTemplateID=" + mKeyTemplateID +
                ", mKeyType=" + mKeyType +
                ", mKeyValue='" + mKeyValue + '\'' +
                '}';
    }

    public int getmKeyTemplateID() {
        return mKeyTemplateID;
    }

    public void setmKeyTemplateID(int mKeyTemplateID) {
        this.mKeyTemplateID = mKeyTemplateID;
    }

    public int getmKeyType() {
        return mKeyType;
    }

    public void setmKeyType(int mKeyType) {
        this.mKeyType = mKeyType;
    }

    public String getmKeyValue() {
        return mKeyValue;
    }

    public void setmKeyValue(String mKeyValue) {
        this.mKeyValue = mKeyValue;
    }
}
