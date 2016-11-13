/**************************************************************************************************
Filename:       irda_decode.h
Revised:        Date: 2016-10-01
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************************/
#ifndef _IRDA_DECODE_H_
#define _IRDA_DECODE_H_

#include <stdio.h>
#include "irda_defs.h"

#define TAG_COUNT_FOR_PROTOCOL 29
#define TAG_COUNT_FOR_BC_PROTOCOL 20

#define KEY_COUNT 15

#define EXPECTED_MEM_SIZE 1024

#define TAG_INVALID 0xffff
#define MAX_DELAYCODE_NUM 16
#define MAX_BITNUM 16

#define IR_DECODE_FAILED (-1)
#define IR_DECODE_SUCCEEDED  (0)

#define AC_PARAMETER_TYPE_1 0
#define AC_PARAMETER_TYPE_2 1

typedef enum
{
    AC_POWER_ON = 0,
    AC_POWER_OFF,
    AC_POWER_MAX
} ac_power;

typedef enum
{
    AC_TEMP_16 = 0,
    AC_TEMP_17,
    AC_TEMP_18,
    AC_TEMP_19,
    AC_TEMP_20,
    AC_TEMP_21,
    AC_TEMP_22,
    AC_TEMP_23,
    AC_TEMP_24,
    AC_TEMP_25,
    AC_TEMP_26,
    AC_TEMP_27,
    AC_TEMP_28,
    AC_TEMP_29,
    AC_TEMP_30,
    AC_TEMP_MAX
} ac_temperature;

typedef enum
{
    AC_MODE_COOL = 0,
    AC_MODE_HEAT,
    AC_MODE_AUTO,
    AC_MODE_FAN,
    AC_MODE_DRY,
    AC_MODE_MAX
} ac_mode;

typedef enum
{
    AC_FUNCTION_POWER = 1,
    AC_FUNCTION_MODE,
    AC_FUNCTION_TEMPERATURE_UP,
    AC_FUNCTION_TEMPERATURE_DOWN,
    AC_FUNCTION_WIND_SPEED,
    AC_FUNCTION_WIND_SWING,
    AC_FUNCTION_WIND_FIX,
    AC_FUNCTION_MAX,
} ac_function;

typedef enum
{
    AC_WS_AUTO = 0,
    AC_WS_LOW,
    AC_WS_MEDIUM,
    AC_WS_HIGH,
    AC_WS_MAX
} ac_wind_speed;

typedef enum
{
    AC_SWING_ON = 0,
    AC_SWING_OFF,
    AC_SWING_MAX
} ac_swing;

typedef enum
{
    SWING_TYPE_SWING_ONLY = 0,
    SWING_TYPE_NORMAL,
    SWING_TYPE_NOT_SPECIFIED,
    SWING_TYPE_MAX
} swing_type;

typedef enum
{
    TEMP_TYPE_DYNAMIC = 0,
    TEMP_TYPE_STATIC,
    TEMP_TYPE_MAX,
} temp_type;

// enumeration for application polymorphism
typedef enum
{
    AC_APPLY_POWER = 0,
    AC_APPLY_MODE,
    AC_APPLY_TEMPERATURE_UP,
    AC_APPLY_TEMPERATURE_DOWN,
    AC_APPLY_WIND_SPEED,
    AC_APPLY_WIND_SWING,
    AC_APPLY_WIND_FIX,
    AC_APPLY_MAX
} ac_apply;

typedef struct _ac_hex
{
    UINT8 len;
    UINT8 *data;
} ac_hex;

typedef struct _ac_level
{
    UINT16 low;
    UINT16 high;
} ac_level;

typedef struct _ac_bootcode
{
    UINT16 len;
    UINT16 data[16];
} ac_bootcode;

typedef struct _ac_delaycode
{
    INT16 pos;
    UINT16 time[8];
    UINT16 time_cnt;
} ac_delaycode;

/*
 * the array of tag_100X application data
 * seg_len : length for each segment
 * byte_pos : the position of update byte
 * byte_value : the value to be updated to position
 */
typedef struct _tag_comp_type_1
{
    UINT8 seg_len;
    UINT8 *segment;
} tag_comp;

typedef struct _tag_1506_swing_info
{
    swing_type type;
    UINT8 mode_count;
    UINT8 dir_index;
} swing_info;

typedef struct _tag_1001_power_1
{
    UINT8 len;
    tag_comp comp_data[AC_POWER_MAX];
} power_1;

typedef struct _tag_1003_temp_1
{
    UINT8 len;
    UINT8 type;
    tag_comp comp_data[AC_TEMP_MAX];
} temp_1;

typedef struct tag_1004_mode_1
{
    UINT8 len;
    tag_comp comp_data[AC_MODE_MAX];
} mode_1;

typedef struct tag_1005_speed_1
{
    UINT8 len;
    tag_comp comp_data[AC_WS_MAX];
} speed_1;

typedef struct tag_1007_swing_1
{
    UINT8 len;
    UINT16 count;
    tag_comp *comp_data;
} swing_1;

typedef struct tag_1011_temp_2
{
    UINT8 len;
    UINT8 type;
    tag_comp comp_data[AC_TEMP_MAX];
} temp_2;

typedef struct tag_1012_mode_2
{
    UINT8 len;
    tag_comp comp_data[AC_MODE_MAX];
} mode_2;

typedef struct tag_1013_speed_2
{
    UINT8 len;
    tag_comp comp_data[AC_WS_MAX];
} speed_2;

typedef struct tag_1015_swing_2
{
    UINT8 len;
    UINT16 count;
    tag_comp *comp_data;
} swing_2;

#if defined SUPPORT_HORIZONTAL_SWING
typedef struct tag_1006_horiswing_1
{
    UINT16 len;
    tag_comp comp_data[AC_HORI_SWING_MAX];
} hori_swing_1;
#endif

typedef struct _tag_checksum_data
{
    UINT8 len;
    UINT8 type;
    UINT8 start_byte_pos;
    UINT8 end_byte_pos;
    UINT8 checksum_byte_pos;
    UINT8 checksum_plus;
    UINT8 *spec_pos;
} tag_checksum_data;

typedef struct tag_checksum
{
    UINT8 len;
    UINT16 count;
    tag_checksum_data *checksum_data;
} tchecksum;

typedef struct tag_function_1
{
    UINT8 len;
    tag_comp comp_data[AC_FUNCTION_MAX - 1];
} function_1;

typedef struct tag_function_2
{
    UINT8 len;
    tag_comp comp_data[AC_FUNCTION_MAX - 1];
} function_2;

typedef struct tag_solo_code
{
    UINT8 len;
    UINT8 solo_func_count;
    UINT8 solo_function_codes[AC_FUNCTION_MAX - 1];
} solo_code;

typedef struct _ac_bitnum
{
    INT16 pos;
    UINT16 bits;
} ac_bitnum;

typedef enum
{
    N_COOL = 0,
    N_HEAT,
    N_AUTO,
    N_FAN,
    N_DRY,
    N_MODE_MAX,
} ac_n_mode;

typedef enum
{
    CHECKSUM_TYPE_BYTE = 1,
    CHECKSUM_TYPE_BYTE_INVERSE,
    CHECKSUM_TYPE_HALF_BYTE,
    CHECKSUM_TYPE_HALF_BYTE_INVERSE,
    CHECKSUM_TYPE_SPEC_HALF_BYTE,
    CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE,
    CHECKSUM_TYPE_SPEC_HALF_BYTE_ONE_BYTE,
    CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE_ONE_BYTE,
    CHECKSUM_TYPE_MAX,
} checksum_type;

typedef struct _ac_n_mode_info
{
    UINT8 enable;
    UINT8 allspeed;
    UINT8 alltemp;
    UINT8 temp[AC_TEMP_MAX];
    UINT8 temp_cnt;
    UINT8 speed[AC_WS_MAX];
    UINT8 speed_cnt;
} ac_n_mode_info;

typedef struct ac_protocol
{
    UINT8 endian;
    // ac_hex default_code;
    ac_hex default_code;
    ac_level zero;
    ac_level one;
    ac_bootcode bootcode;
    ac_delaycode dc[MAX_DELAYCODE_NUM];
    power_1 power1;
    temp_1 temp1;
    mode_1 mode1;
    speed_1 speed1;
    swing_1 swing1;
    tchecksum checksum;

    function_1 function1;
    function_2 function2;

    temp_2 temp2;
    mode_2 mode2;
    speed_2 speed2;
    swing_2 swing2;

    swing_info si;
    solo_code sc;

    UINT8 swing_status;

    BOOL change_wind_direction;

    UINT16 dc_cnt;
    ac_bitnum bitnum[MAX_BITNUM];
    UINT16 bitnum_cnt;
    UINT16 repeat_times;
    UINT16 frame_length;
    ac_n_mode_info n_mode[N_MODE_MAX];
    UINT16 code_cnt;
    UINT8 lastbit;
    UINT16 *time;
    UINT8 solo_function_mark;
} protocol;

typedef struct tag_head
{
    UINT16 tag;
    UINT16 len;
    unsigned short offset;
    UINT8 *pdata;
} t_tag_head;

struct ir_bin_buffer
{
    UINT8 *data;
    UINT16 len;
    UINT16 offset;
};

typedef struct REMOTE_AC_STATUS
{
    UINT8 acPower;
    UINT8 acTemp;
    UINT8 acMode;
    UINT8 acWindDir;
    UINT8 acWindSpeed;
    UINT8 acDisplay;
    UINT8 acSleep;
    UINT8 acTimer;
} remote_ac_status_t;

// function polymorphism
typedef INT8 (*lp_apply_ac_parameter) (remote_ac_status_t ac_status, UINT8 function_code);

#define TAG_AC_POWER_1            1001
#define TAG_AC_DEFAULT_CODE        1002
#define TAG_AC_TEMP_1            1003
#define TAG_AC_MODE_1            1004
#define TAG_AC_SPEED_1            1005
#define TAG_AC_SWING_1            1007

#define TAG_AC_CHECKSUM_TYPE    1008

#define TAG_AC_TEMP_2            1011
#define TAG_AC_MODE_2            1012
#define TAG_AC_SPEED_2            1013
#define TAG_AC_SWING_2            1015

#define TAG_AC_SOLO_FUNCTION     1009

#define TAG_AC_FUNCTION_1        1010
#define TAG_AC_FUNCTION_2        1016

#define TAG_AC_SWING_INFO        1506

#define TAG_AC_BOOT_CODE        300
#define TAG_AC_ZERO            301
#define TAG_AC_ONE                302
#define TAG_AC_DELAY_CODE        303
#define TAG_AC_FRAME_LENGTH        304
#define TAG_AC_REPEAT_TIMES        1508
#define TAG_AC_BITNUM            1509

#define TAG_AC_ENDIAN            306
#define TAG_AC_LASTBIT          307

#define TAG_AC_BAN_FUNCTION_IN_COOL_MODE  1501
#define TAG_AC_BAN_FUNCTION_IN_HEAT_MODE  1502
#define TAG_AC_BAN_FUNCTION_IN_AUTO_MODE  1503
#define TAG_AC_BAN_FUNCTION_IN_FAN_MODE   1504
#define TAG_AC_BAN_FUNCTION_IN_DRY_MODE   1505

// definition about size

#define PROTOCOL_SIZE (sizeof(protocol))

/* exported variables */
extern UINT8* ir_hex_code;
extern UINT8 ir_hex_len;
extern protocol* context;
extern remote_ac_status_t ac_status;
extern UINT16 user_data[];

/* exported functions */
///////////////////////////////////////////////// AC Begin /////////////////////////////////////////////////
/*
 * function irda_context_init
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 irda_context_init();

/*
 * function irda_ac_lib_open
 *
 * parameters:  binary (in) binary content
 *              binary_length (in) length of binary content
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 irda_ac_lib_open(UINT8 *binary, UINT16 binary_length);

/*
 * function irda_ac_lib_parse
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 irda_ac_lib_parse();

/*
 * function irda_ac_lib_control
 *
 * parameters:  ac_status (in) indicates the current status of air conditioner to be controlled
 *              user_data (out) wave code array to be transmitted
 *              function_code (in) indicates the AC function to be updated
 *              change_wind_direction (in) indicates if the wind direction need to be changed
 *
 * return: length of wave code array
 */
extern UINT16 irda_ac_lib_control(remote_ac_status_t ac_status, UINT16 *user_data, UINT8 function_code,
                                  BOOL change_wind_direction);

/*
 * function irda_ac_lib_close
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern void irda_ac_lib_close();
///////////////////////////////////////////////// AC End /////////////////////////////////////////////////

///////////////////////////////////////////////// TV Begin /////////////////////////////////////////////////
/*
 * function irda_tv_lib_open
 *
 * parameters:  binary (in) binary content
 *              binary_length (in) length of binary content
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
INT8 irda_tv_lib_open(UINT8 *binary, UINT16 binary_length);

/*
 * function irda_tv_lib_parse
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 irda_tv_lib_parse(UINT8 irda_hex_encode);

/*
 * function irda_tv_lib_control
 *
 * parameters:  key_code (in) indicates the number of pressed key
 *              user_data (out) wave code array to be transmitted
 *
 * return: length of wave code array
 */
extern UINT16 irda_tv_lib_control(UINT8 key_code, UINT16 * l_user_data);

/*
 * function irda_tv_lib_close
 *
 * parameters:
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 irda_tv_lib_close();
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
extern INT8 get_temperature_range(UINT8 ac_mode, INT8* temp_min, INT8* temp_max);

/*
 * function get_supported_mode
 *
 * parameters:  supported_mode (out) mode supported by the remote in lower 5 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_mode(UINT8* supported_mode);

/*
 * function get_supported_wind_speed
 *
 * parameters:  ac_mode (in) specify in which AC mode the application need to get wind speed info
 *              supported_wind_speed (out) wind speed supported by the remote in lower 4 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_wind_speed(UINT8 ac_mode, UINT8* supported_wind_speed);

/*
 * function get_supported_swing
 *
 * parameters:  ac_mode (in) specify in which AC mode the application need to get swing info
 *              supported_swing (out) swing supported by the remote in lower 2 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
extern INT8 get_supported_swing(UINT8 ac_mode, UINT8* supported_swing);

/*
 * function get_supported_wind_direction
 *
 * parameters:  supported_wind_direction (out) swing supported by the remote in lower 2 bits
 *
 * return: IR_DECODE_SUCCEEDED / IR_DECODE_FAILED
 */
INT8 get_supported_wind_direction(UINT8* supported_wind_direction);

///////////////////////////////////////////////// Utils End /////////////////////////////////////////////////

#endif // _IRDA_DECODE_H_
