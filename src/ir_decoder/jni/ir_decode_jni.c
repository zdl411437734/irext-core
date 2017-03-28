/**************************************************************************************************
Filename:       ir_decode_jni.c
Revised:        Date: 2016-03-21
Revision:       Revision: 1.0

Description:    This file links to java layer for Android application

Revision log:
* 2016-03-21: created by strawmanbobi
**************************************************************************************************/
#include <jni.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include "ir_decode_jni.h"
#include "../include/ir_defs.h"
#include "../include/ir_decode.h"

// global variable definition
extern size_t binary_length;
extern UINT8 *binary_content;

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irACLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);
    if (IR_DECODE_FAILED == ir_ac_file_open(n_file_name))
    {
        ir_ac_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == ir_ac_lib_parse())
    {
        ir_ac_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jintArray JNICALL Java_net_irext_remote_service_DecodeService_irACControl
          (JNIEnv *env, jobject this_obj, jobject jni_ac_status, jint function_code, jint change_wind_direction)
{
	UINT16 user_data[USER_DATA_SIZE];
    int i = 0;
    int copy_array[USER_DATA_SIZE] = {0};
	remote_ac_status_t ac_status;

    jclass n_ac_status = (*env)->GetObjectClass(env, jni_ac_status);
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

    ir_printf("\nget ac status : %d, %d, %d, %d, %d, %d\n",
        i_ac_power,
        i_ac_mode,
        i_ac_temp,
        i_ac_wind_dir,
        i_ac_wind_speed,
        function_code);

    ac_status.acDisplay = 0;
    ac_status.acSleep = 0;
    ac_status.acTimer = 0;
    ac_status.acPower = i_ac_power;
    ac_status.acMode = i_ac_mode;
    ac_status.acTemp = i_ac_temp;
    ac_status.acWindDir = i_ac_wind_dir;
    ac_status.acWindSpeed = i_ac_wind_speed;

    int wave_code_length = ir_ac_lib_control(ac_status, user_data, function_code, change_wind_direction);

    ir_printf("\nsize of wave code = %d\n", wave_code_length);

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

    // temporary solution, close ac lib here in order to release memory
    // ir_ac_lib_close();

    return result;
}

JNIEXPORT void JNICALL Java_net_irext_remote_service_DecodeService_irACLibClose
          (JNIEnv *env, jobject this_obj)
{
    ir_ac_lib_close();
}

JNIEXPORT jobject JNICALL Java_net_irext_remote_service_DecodeService_irACGetTemperatureRange
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int tempMin = 0;
    int tempMax = 0;

    jobject temperature_range = NULL;
    jclass temperature_range_class = (*env)->FindClass(env, "com/irext/remote/bean/jnibean/JNITemperatureRange");
    jmethodID temperature_range_mid = (*env)->GetMethodID(env, temperature_range_class, "<init>", "()V");
    jfieldID min_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMin", "I");
    jfieldID max_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMax", "I");

    temperature_range = (*env)->NewObject(env, temperature_range_class, temperature_range_mid);

    get_temperature_range((UINT8)ac_mode, (INT8*)&tempMin, (INT8*)&tempMax);

    (*env)->SetIntField(env, temperature_range, min_temp_fid, tempMin);
    (*env)->SetIntField(env, temperature_range, max_temp_fid, tempMax);

    return temperature_range;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irACGetSupportedMode
          (JNIEnv *env, jobject this_obj)
{
    int supported_mode = 0;
    get_supported_mode((UINT8*)&supported_mode);
    return supported_mode;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irACGetSupportedWindSpeed
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_wind_speed = 0;
    get_supported_wind_speed((UINT8)ac_mode, (UINT8*)&supported_wind_speed);
    return supported_wind_speed;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irACGetSupportedSwing
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_swing = 0;
    get_supported_swing((UINT8)ac_mode, (UINT8*)&supported_swing);
    return supported_swing;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irACGetSupportedWindDirection
          (JNIEnv *env, jobject this_obj)
{
    int supported_wind_direction = 0;
    get_supported_wind_direction((UINT8*)&supported_wind_direction);
    return supported_wind_direction;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irTVLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name, jint j_ir_hex_encode)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);

    if (IR_DECODE_FAILED == ir_tv_file_open(n_file_name))
    {
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == ir_tv_lib_parse(j_ir_hex_encode))
    {
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jintArray JNICALL Java_net_irext_remote_service_DecodeService_irTVControl
          (JNIEnv *env, jobject this_obj, jint key_number)
{
    UINT16 user_data[USER_DATA_SIZE];
    int i = 0;
    int copy_array[USER_DATA_SIZE] = {0};
    int wave_code_length = ir_tv_lib_control(key_number, user_data);

    ir_printf("\nsize of wave code = %d\n", wave_code_length);

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

    return result;
}

JNIEXPORT void JNICALL Java_net_irext_remote_service_DecodeService_irTVLibClose
          (JNIEnv *env, jobject this_obj)
{
    // do nothing
    return;
}