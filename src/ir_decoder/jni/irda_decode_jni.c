/**************************************************************************************************
Filename:       irda_decode_jni.c
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
#include "../include/irda_decode_jni.h"
#include "../include/irda_defs.h"
#include "../include/irda_decode.h"

// global variable definition
UINT16 binary_length = 0;
UINT8 *binary_content = NULL;

INT8 irda_ac_file_open(const char* file_name)
{
    FILE *stream = fopen(file_name, "rb");
    if (NULL == stream)
    {
        IR_PRINTF("\nfile open failed : %d\n", errno);
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_END);
    binary_length = ftell(stream);
    binary_content = (UINT8*) irda_malloc(binary_length);

    if (NULL == binary_content)
    {
        IR_PRINTF("\nfailed to alloc memory for binary\n");
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_SET);
    fread(binary_content, binary_length, 1, stream);
    fclose(stream);

    if (IR_DECODE_FAILED == irda_ac_lib_open(binary_content, binary_length))
    {
        irda_free(binary_content);
        binary_length = 0;
        return IR_DECODE_FAILED;
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 irda_tv_file_open(const char* file_name)
{
    int print_index = 0;
    FILE *stream = fopen(file_name, "rb");

    IR_PRINTF("file name = %s\n", file_name);

    if (stream == NULL)
    {
        IR_PRINTF("\nfile open failed : %d\n", errno);
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_END);
    binary_length = ftell(stream);
    IR_PRINTF("length of binary = %d\n", binary_length);

    binary_content = (UINT8*) irda_malloc(binary_length);

    fseek(stream, 0, SEEK_SET);
    fread(binary_content, binary_length, 1, stream);
    fclose(stream);

    if (IR_DECODE_FAILED == irda_tv_lib_open(binary_content, binary_length))
    {
        irda_free(binary_content);
        binary_length = 0;
        return IR_DECODE_FAILED;
    }

    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaACLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);
    if (IR_DECODE_FAILED == irda_ac_file_open(n_file_name))
    {
        irda_ac_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    // no need to verify return value
    irda_context_init();

    if (IR_DECODE_FAILED == irda_ac_lib_parse())
    {
        irda_ac_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jintArray JNICALL Java_net_irext_remote_service_DecodeService_irdaACControl
          (JNIEnv *env, jobject this_obj, jobject jni_ac_status, jint function_code, jint change_wind_direction)
{
    int i = 0;
    int copy_array[USER_DATA_SIZE] = {0};

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

    IR_PRINTF("\nget ac status : %d, %d, %d, %d, %d, %d\n",
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

    int wave_code_length = irda_ac_lib_control(ac_status, user_data, function_code, change_wind_direction);

    IR_PRINTF("\nsize of wave code = %d\n", wave_code_length);

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
    // irda_ac_lib_close();

    return result;
}

JNIEXPORT void JNICALL Java_net_irext_remote_service_DecodeService_irdaACLibClose
          (JNIEnv *env, jobject this_obj)
{
    irda_ac_lib_close();
}

JNIEXPORT jobject JNICALL Java_net_irext_remote_service_DecodeService_irdaACGetTemperatureRange
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

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaACGetSupportedMode
          (JNIEnv *env, jobject this_obj)
{
    int supported_mode = 0;
    get_supported_mode((UINT8*)&supported_mode);
    return supported_mode;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaACGetSupportedWindSpeed
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_wind_speed = 0;
    get_supported_wind_speed((UINT8)ac_mode, (UINT8*)&supported_wind_speed);
    return supported_wind_speed;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaACGetSupportedSwing
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_swing = 0;
    get_supported_swing((UINT8)ac_mode, (UINT8*)&supported_swing);
    return supported_swing;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaACGetSupportedWindDirection
          (JNIEnv *env, jobject this_obj)
{
    int supported_wind_direction = 0;
    get_supported_wind_direction((UINT8*)&supported_wind_direction);
    return supported_wind_direction;
}

JNIEXPORT jint JNICALL Java_net_irext_remote_service_DecodeService_irdaTVLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name, jint j_irda_hex_encode)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);

    if (IR_DECODE_FAILED == irda_tv_file_open(n_file_name))
    {
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == irda_tv_lib_parse(j_irda_hex_encode))
    {
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jintArray JNICALL Java_net_irext_remote_service_DecodeService_irdaTVControl
          (JNIEnv *env, jobject this_obj, jint key_number)
{
    int i = 0;
    int copy_array[USER_DATA_SIZE] = {0};
    int wave_code_length = irda_tv_lib_control(key_number, user_data);

    IR_PRINTF("\nsize of wave code = %d\n", wave_code_length);

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

JNIEXPORT void JNICALL Java_net_irext_remote_service_DecodeService_irdaTVLibClose
          (JNIEnv *env, jobject this_obj)
{
    // do nothing
    return;
}