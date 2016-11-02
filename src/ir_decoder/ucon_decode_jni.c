/**************************************************************************************************
Filename:       ucon_decode_jni.c
Revised:        Date: 2016-03-21
Revision:       Revision: 1.0

Description:    This file links to java layer for Android application

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2016-03-21: created by strawmanbobi
**************************************************************************************************/
#include <jni.h>
#include <stdio.h>
#include "include/ucon_decode_jni.h"
#include "irda_defs.h"
#include "ucon_decode.h"

// function declaration
void FillBCCommandValuesToJni(JNIEnv* env, jobject j_bc_command, jclass bccommand_class, t_bc_command bc_command);

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);
    if (IR_DECODE_FAILED == irda_ac_lib_open(n_file_name))
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

JNIEXPORT jintArray JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACControl
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

JNIEXPORT void JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACLibClose
          (JNIEnv *env, jobject this_obj)
{
    irda_ac_lib_close();
}

JNIEXPORT jobject JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACGetTemperatureRange
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int tempMin = 0;
    int tempMax = 0;

    jobject temperature_range = NULL;
    jclass temperature_range_class = (*env)->FindClass(env, "com/yuekong/remote/bean/jnibean/JNITemperatureRange");
    jmethodID temperature_range_mid = (*env)->GetMethodID(env, temperature_range_class, "<init>", "()V");
    jfieldID min_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMin", "I");
    jfieldID max_temp_fid = (*env)->GetFieldID(env, temperature_range_class, "tempMax", "I");

    temperature_range = (*env)->NewObject(env, temperature_range_class, temperature_range_mid);

    get_temperature_range((UINT8)ac_mode, (UINT8*)&tempMin, (UINT8*)&tempMax);

    (*env)->SetIntField(env, temperature_range, min_temp_fid, tempMin);
    (*env)->SetIntField(env, temperature_range, max_temp_fid, tempMax);

    return temperature_range;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACGetSupportedMode
          (JNIEnv *env, jobject this_obj)
{
    int supported_mode = 0;
    get_supported_mode((UINT8*)&supported_mode);
    return supported_mode;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACGetSupportedWindSpeed
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_wind_speed = 0;
    get_supported_wind_speed((UINT8)ac_mode, (UINT8*)&supported_wind_speed);
    return supported_wind_speed;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACGetSupportedSwing
          (JNIEnv *env, jobject this_obj, jint ac_mode)
{
    int supported_swing = 0;
    get_supported_swing((UINT8)ac_mode, (UINT8*)&supported_swing);
    return supported_swing;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaACGetSupportedWindDirection
          (JNIEnv *env, jobject this_obj)
{
    int supported_wind_direction = 0;
    get_supported_wind_direction((UINT8*)&supported_wind_direction);
    return supported_wind_direction;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_irdaTVLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name, jint j_irda_hex_encode)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);

    if (IR_DECODE_FAILED == irda_tv_lib_open(n_file_name))
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

JNIEXPORT jintArray JNICALL Java_com_yuekong_remote_service_DecodeService_irdaTVControl
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

JNIEXPORT void JNICALL Java_com_yuekong_remote_service_DecodeService_irdaTVLibClose
          (JNIEnv *env, jobject this_obj)
{
    // do nothing
    return;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_bcLibOpen
          (JNIEnv *env, jobject this_obj, jstring file_name)
{
    const char *n_file_name = (*env)->GetStringUTFChars(env, file_name, 0);
    if (IR_DECODE_FAILED == bc_lib_open(n_file_name))
    {
        bc_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    // no need to verify return value
    bc_context_init();

    if (IR_DECODE_FAILED == bc_lib_parse())
    {
        bc_lib_close();
        (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
        return IR_DECODE_FAILED;
    }

    (*env)->ReleaseStringUTFChars(env, file_name, n_file_name);
    return IR_DECODE_SUCCEEDED;
}

JNIEXPORT jint JNICALL Java_com_yuekong_remote_service_DecodeService_bcGetNeedConnAck
          (JNIEnv *env, jobject this_obj)
{
    return context_bc->need_connection_ack;
}

JNIEXPORT jstring JNICALL Java_com_yuekong_remote_service_DecodeService_bcGetDeviceName
          (JNIEnv *env, jobject this_obj)
{
    jstring ret_name;
    const char* device_name = context_bc->device_name;
    ret_name = (*env)->NewStringUTF(env, device_name);
    return ret_name;
}

JNIEXPORT jintArray JNICALL Java_com_yuekong_remote_service_DecodeService_bcGetValidKeys
          (JNIEnv *env, jobject this_obj)
{
    jintArray result;
    int valid_keys[KEY_COUNT] = {0};
    int valid_keys_length = get_valid_keys(valid_keys);

    result = (*env)->NewIntArray(env, valid_keys_length);
    if (result == NULL)
    {
        return NULL;
    }
    (*env)->SetIntArrayRegion(env, result, 0, valid_keys_length, valid_keys);

    return result;
}

JNIEXPORT void JNICALL Java_com_yuekong_remote_service_DecodeService_bcLibClose
          (JNIEnv *env, jobject this_obj)
{
    bc_lib_close();
}

JNIEXPORT jobject JNICALL Java_com_yuekong_remote_service_DecodeService_bcGetConnAck
          (JNIEnv *env, jobject this_obj)
{
    int segment_count = 0;
    int i = 0;
    jobject bc_commands = NULL;

    jclass bccommands_class = (*env)->FindClass(env, "com/yuekong/remote/bean/jnibean/JNIBCCommands");
    jclass bccommand_class = (*env)->FindClass(env, "com/yuekong/remote/bean/jnibean/JNIBCCommand");

    jmethodID bccommands_mid = (*env)->GetMethodID(env, bccommands_class, "<init>", "()V");
    jmethodID bccommand_mid = (*env)->GetMethodID(env, bccommand_class, "<init>", "()V");

    bc_commands = (*env)->NewObject(env, bccommands_class, bccommands_mid);

    // get connection ACK info
    segment_count = context_bc->conn_ack.seg_count;
    // set segment count for result data-structure
    jfieldID segment_count_fid = (*env)->GetFieldID(env, bccommands_class, "segmentCount", "I");
    jfieldID commands_fid = (*env)->GetFieldID(env,
                                                bccommands_class,
                                                "commands",
                                                "[com/yuekong/remote/bean/jnibean/JNIBCCommand");

    (*env)->SetIntField(env, bc_commands, segment_count_fid, segment_count);

    // fill bc_command array for bc_commands
    jobjectArray j_bc_command_array = (*env)->NewObjectArray(env, segment_count, bccommand_class, NULL);

    for (i = 0; i < segment_count; i++)
    {
        jobject bc_command = (*env)->NewObject(env, bccommand_class, bccommand_mid);
        FillBCCommandValuesToJni(env, bc_command, bccommand_class, context_bc->conn_ack.commands[i]);
        (*env)->SetObjectArrayElement(env, j_bc_command_array,
                i, bc_command);
    }
    (*env)->SetObjectField(env, bc_commands, commands_fid, j_bc_command_array);

    return bc_commands;
}

JNIEXPORT jobject JNICALL Java_com_yuekong_remote_service_DecodeService_bcGetCommand
          (JNIEnv *env, jobject this_obj, jint key_number)
{
    int segment_count = 0;
    int i = 0;
    jobject bc_commands = NULL;

    jclass bccommands_class = (*env)->FindClass(env, "com/yuekong/remote/bean/jnibean/JNIBCCommands");
    jclass bccommand_class = (*env)->FindClass(env, "com/yuekong/remote/bean/jnibean/JNIBCCommand");

    jmethodID bccommands_mid = (*env)->GetMethodID(env, bccommands_class, "<init>", "()V");
    jmethodID bccommand_mid = (*env)->GetMethodID(env, bccommand_class, "<init>", "()V");

    bc_commands = (*env)->NewObject(env, bccommands_class, bccommands_mid);

    // get connection ACK info
    segment_count = context_bc->conn_ack.seg_count;
    // set segment count for result data-structure
    jfieldID segment_count_fid = (*env)->GetFieldID(env, bccommands_class, "segmentCount", "I");
    jfieldID commands_fid = (*env)->GetFieldID(env,
                                                bccommands_class,
                                                "commands",
                                                "[com/yuekong/remote/bean/jnibean/JNIBCCommand");

    (*env)->SetIntField(env, bc_commands, segment_count_fid, segment_count);

    // fill bc_command array for bc_commands
    jobjectArray j_bc_command_array = (*env)->NewObjectArray(env, segment_count, bccommand_class, NULL);

    for (i = 0; i < segment_count; i++)
    {
        jobject bc_command = (*env)->NewObject(env, bccommand_class, bccommand_mid);
        FillBCCommandValuesToJni(env, bc_command, bccommand_class, context_bc->generic_command[key_number].commands[i]);
        (*env)->SetObjectArrayElement(env, j_bc_command_array,
                i, bc_command);
    }
    (*env)->SetObjectField(env, bc_commands, commands_fid, j_bc_command_array);

    return bc_commands;
}

// utils
void FillBCCommandValuesToJni(JNIEnv* env, jobject j_bc_command, jclass bccommand_class, t_bc_command n_bc_command)
{
    int copy_array[BLE_GAP_MTU] = {0};
    jintArray ble_command_array = NULL;
    int i = 0;

    jfieldID length_fid = (*env)->GetFieldID(env, bccommand_class, "length", "I");
    jfieldID handle_fid = (*env)->GetFieldID(env, bccommand_class, "handle", "I");
    jfieldID command_fid = (*env)->GetFieldID(env, bccommand_class, "command", "[I");

    IR_PRINTF("Set int field [length] for bc_command : %d\n", n_bc_command.length);
    (*env)->SetIntField(env, j_bc_command, length_fid, n_bc_command.length);
    IR_PRINTF("Set int field [handle] for bc_command : 0x%02X\n", n_bc_command.handle);
    (*env)->SetIntField(env, j_bc_command, handle_fid, n_bc_command.handle);

    ble_command_array = (*env)->NewIntArray(env, BLE_GAP_MTU);

    // prepare BLE command as int32 for java
    for(i = 0; i < BLE_GAP_MTU; i++)
    {
        copy_array[i] = n_bc_command.command[i];
        IR_PRINTF("command %d origin_value = %02X, converted_value = %02X ", i, n_bc_command.command[i], copy_array[i]);
    }
    (*env)->SetIntArrayRegion(env, ble_command_array, 0, BLE_GAP_MTU, copy_array);
    (*env)->SetObjectField(env, j_bc_command, command_fid, ble_command_array);
}