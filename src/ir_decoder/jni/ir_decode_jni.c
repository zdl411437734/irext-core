/**************************************************************************************************
Filename:       ir_decode_jni.c
Revised:        Date: 2016-03-21
Revision:       Revision: 1.0

Description:    This file links to java layer for Android application

Revision log:
* 2016-03-21: created by strawmanbobi
**************************************************************************************************/
#include <stdlib.h>
#include <stdio.h>

#include "ir_decode_jni.h"
#include "../include/ir_defs.h"
#include "../include/ir_decode.h"

// global variable definition
extern size_t binary_length;
extern UINT8 *binary_content;

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irOpen
          (JNIEnv *env, jobject this_obj, jint category_id, jint sub_cate, jstring file_name)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);
    if (IR_DECODE_FAILED == ir_file_open(category_id, sub_cate, n_file_name))
    {
        ir_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irOpenBinary
          (JNIEnv *env, jobject this_obj, jint category_id, jint sub_cate,
           jbyteArray binaries, jint bin_length)
{
    jbyte* j_buffer = (*env)->GetByteArrayElements(env, binaries, 0);
    unsigned char* buffer = (unsigned char*)j_buffer;

    if (IR_DECODE_FAILED == ir_binary_open(category_id, sub_cate, buffer, bin_length))
    {
        ir_close();
        (*env)->ReleaseByteArrayElements(env, binaries, j_buffer, JNI_ABORT);
        return IR_DECODE_FAILED;
    }

    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jintArray JNICALL Java_net_irext_decodesdk_IRDecode_irDecode
          (JNIEnv *env, jobject this_obj, jint key_code, jobject jni_ac_status, jint change_wind_direction)
{
    UINT16 user_data[USER_DATA_SIZE];
    int i = 0;
    jint copy_array[USER_DATA_SIZE] = {0};
    remote_ac_status_t ac_status;

    jclass n_ac_status = (*env)->GetObjectClass(env, jni_ac_status);

    if (NULL != n_ac_status)
    {
        jfieldID ac_power_fid = (*env)->GetFieldID(env, n_ac_status, "acPower", "I");
        jint i_ac_power = (*env)->GetIntField(env, jni_ac_status, ac_power_fid);

        jfieldID ac_mode_fid = (*env)->GetFieldID(env, n_ac_status, "acMode", "I");
        jint i_ac_mode = (*env)->GetIntField(env, jni_ac_status, ac_mode_fid);

        jfieldID ac_temp_fid = (*env)->GetFieldID(env, n_ac_status, "acTemp", "I");
        jint i_ac_temp = (*env)->GetIntField(env, jni_ac_status, ac_temp_fid);

        jfieldID ac_wind_dir_fid = (*env)->GetFieldID(env, n_ac_status, "acWindDir", "I");
        jint i_ac_wind_dir = (*env)->GetIntField(env, jni_ac_status, ac_wind_dir_fid);

        jfieldID ac_wind_speed_fid = (*env)->GetFieldID(env, n_ac_status, "acWindSpeed", "I");
        jint i_ac_wind_speed = (*env)->GetIntField(env, jni_ac_status, ac_wind_speed_fid);

        ac_status.acDisplay = 0;
        ac_status.acSleep = 0;
        ac_status.acTimer = 0;
        ac_status.acPower = i_ac_power;
        ac_status.acMode = i_ac_mode;
        ac_status.acTemp = i_ac_temp;
        ac_status.acWindDir = i_ac_wind_dir;
        ac_status.acWindSpeed = i_ac_wind_speed;
    }

    int wave_code_length = ir_decode(key_code, user_data, &ac_status, change_wind_direction);

    jintArray result = (*env)->NewIntArray(env, wave_code_length);
    if (result == NULL)
    {
        return NULL; /* out of memory error thrown */
    }
    for (i = 0; i < wave_code_length; i++)
    {
        copy_array[i] = (int)user_data[i];
    }
    (*env)->SetIntArrayRegion(env, result, 0, wave_code_length, copy_array);
    (*env)->DeleteLocalRef(env, n_ac_status);

    return result;
}

JNIEXPORT void JNICALL Java_net_irext_decodesdk_IRDecode_irClose
          (JNIEnv *env, jobject this_obj)
{
    ir_close();
}

JNIEXPORT jobject JNICALL Java_net_irext_decodesdk_IRDecode_irACGetTemperatureRange
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int tempMin = 0;
    int tempMax = 0;

    jobject temperature_range = NULL;
    jclass temperature_range_class =
        (*env)->FindClass(env, "com/irext/remote/bean/jnibean/JNITemperatureRange");

    jmethodID temperature_range_mid =
        (*env)->GetMethodID(env, temperature_range_class, "<init>", "()V");

    jfieldID min_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMin", "I");
    jfieldID max_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMax", "I");

    temperature_range = (*env)->NewObject(env, temperature_range_class, temperature_range_mid);

    get_temperature_range((UINT8)ac_mode, (INT8*)&tempMin, (INT8*)&tempMax);

    (*env)->SetIntField(env, temperature_range, min_temp_fid, tempMin);
    (*env)->SetIntField(env, temperature_range, max_temp_fid, tempMax);

    return temperature_range;
}

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irACGetSupportedMode
          (JNIEnv *env, jobject this_obj)
{
    int supported_mode = 0;
    get_supported_mode((UINT8*)&supported_mode);
    return supported_mode;
}

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irACGetSupportedWindSpeed
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_wind_speed = 0;
    get_supported_wind_speed((UINT8)ac_mode, (UINT8*)&supported_wind_speed);
    return supported_wind_speed;
}

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irACGetSupportedSwing
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_swing = 0;
    get_supported_swing((UINT8)ac_mode, (UINT8*)&supported_swing);
    return supported_swing;
}

JNIEXPORT jint JNICALL Java_net_irext_decodesdk_IRDecode_irACGetSupportedWindDirection
          (JNIEnv *env, jobject this_obj)
{
    int supported_wind_direction = 0;
    get_supported_wind_direction((UINT8*)&supported_wind_direction);
    return supported_wind_direction;
}