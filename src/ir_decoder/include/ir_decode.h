/**************************************************************************************
Filename:       ir_decode.h
Revised:        Date: 2016-10-01
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************/

#ifndef _IRDA_DECODE_H_
#define _IRDA_DECODE_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdio.h>
#include "ir_defs.h"
#include "ir_ac_control.h"
#include "ir_tv_control.h"

#define IR_DECODE_FAILED             (-1)
#define IR_DECODE_SUCCEEDED          (0)


/* exported functions */
///////////////////////////////////////////////// AC Begin /////////////////////////////////////////////////
/*
 * function ir_ac_file_open
 *
 * parameters:  file name of remote binary
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_ac_file_open(const char *file_name);

/*
 * function ir_ac_lib_open
 *
 * parameters:  binary (in) binary content
 *              binary_length (in) length of binary content
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_ac_lib_open(UINT8 *binary, UINT16 binary_length);

/*
 * function ir_ac_lib_parse
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_ac_lib_parse();

/*
 * function ir_ac_lib_control
 *
 * parameters:  ac_status (in) indicates the current status of air conditioner to be controlled
 *              user_data (out) wave code array to be transmitted
 *              function_code (in) indicates the AC function to be updated
 *              change_wind_direction (in) indicates if the wind direction need to be changed
 *
 * return: length of wave code array
 */
extern UINT16 ir_ac_lib_control(remote_ac_status_t ac_status, UINT16 *user_data, UINT8 function_code,
                                BOOL change_wind_direction);

/*
 * function ir_ac_lib_close
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_ac_lib_close();
///////////////////////////////////////////////// AC End /////////////////////////////////////////////////

///////////////////////////////////////////////// TV Begin /////////////////////////////////////////////////
/*
 * function ir_tv_file_open
 *
 * parameters:  file name of remote binary
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_tv_file_open(const char *file_name);

/*
 * function ir_tv_lib_open
 *
 * parameters:  binary (in) binary content
 *              binary_length (in) length of binary content
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_tv_lib_open(UINT8 *binary, UINT16 binary_length);

/*
 * function ir_tv_lib_parse
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_tv_lib_parse(UINT8 ir_hex_encode);

/*
 * function ir_tv_lib_control
 *
 * parameters:  key_code (in) indicates the number of pressed key
 *              user_data (out) wave code array to be transmitted
 *
 * return: length of wave code array
 */
extern UINT16 ir_tv_lib_control(UINT8 key_code, UINT16 *user_data);

/*
 * function ir_tv_lib_close
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 ir_tv_lib_close();
///////////////////////////////////////////////// TV End /////////////////////////////////////////////////

///////////////////////////////////////////////// Utils Begin /////////////////////////////////////////////////
/*
 * function get_temperature_range
 *
 * parameters:  ac_mode (in) specify in which AC mode the application need to get temperature info
 *              temp_min (out) the min temperature supported in a specified AC mode
 *              temp_max (out) the max temperature supported in a specified AC mode
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_temperature_range(UINT8 ac_mode, INT8 *temp_min, INT8 *temp_max);

/*
 * function get_supported_mode
 *
 * parameters:  supported_mode (out) mode supported by the remote in lower 5 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_mode(UINT8 *supported_mode);

/*
 * function get_supported_wind_speed
 *
 * parameters:  ac_mode (in) specify in which AC mode the application need to get wind speed info
 *              supported_wind_speed (out) wind speed supported by the remote in lower 4 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_wind_speed(UINT8 ac_mode, UINT8 *supported_wind_speed);

/*
 * function get_supported_swing
 *
 * parameters:  ac_mode (in) specify in which AC mode the application need to get swing info
 *              supported_swing (out) swing supported by the remote in lower 2 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_swing(UINT8 ac_mode, UINT8 *supported_swing);

/*
 * function get_supported_wind_direction
 *
 * parameters:  supported_wind_direction (out) swing supported by the remote in lower 2 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_wind_direction(UINT8 *supported_wind_direction);

// private extern function
#if (defined BOARD_PC || defined BOARD_PC_DLL)

extern void ir_lib_free_inner_buffer();

#endif

///////////////////////////////////////////////// Utils End /////////////////////////////////////////////////

#ifdef __cplusplus
}
#endif

#endif // _IRDA_DECODE_H_
