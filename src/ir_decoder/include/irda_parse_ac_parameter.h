/**************************************************************************************************
Filename:       irda_parse_ac_parameter.h
Revised:        Date: 2016-10-12
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for AC functionality parameters

Revision log:
* 2016-10-12: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "irda_decode.h"

#ifndef _IRDA_PARSE_AC_PARAMETER_H_
#define _IRDA_PARSE_AC_PARAMETER_H_

#ifdef __cplusplus
extern "C"
{
#endif

/*
 * public macros
 */

/*
 * public type definition
 */

/*
 * public function declaration
 */

extern INT8 parse_common_ac_parameter(t_tag_head *tag, tag_comp *comp_data, UINT8 with_end, UINT8 type);

extern INT8 parse_defaultcode_1002(struct tag_head *tag, ac_hex *default_code);

#if (defined BOARD_PC) || (defined BOARD_ANDROID)

extern INT8 parse_power_1_1001(struct tag_head *tag, power_1 *power1);

#endif

extern INT8 parse_temp_1_1003(struct tag_head *tag, temp_1 *temp1);

#if (defined BOARD_PC) || (defined BOARD_ANDROID)

extern INT8 parse_mode_1_1004(struct tag_head *tag, mode_1 *mode1);

extern INT8 parse_speed_1_1005(struct tag_head *tag, speed_1 *speed1);

extern INT8 parse_swing_1_1007(struct tag_head *tag, swing_1 *swing1, UINT16 swing_count);

#endif

extern INT8 parse_checksum_1008(struct tag_head *tag, tchecksum *checksum);

extern INT8 parse_function_1_1010(struct tag_head *tag, function_1 *function1);

extern INT8 parse_temp_2_1011(struct tag_head *tag, temp_2 *temp2);

#if (defined BOARD_PC) || (defined BOARD_ANDROID)

extern INT8 parse_mode_2_1012(struct tag_head *tag, mode_2 *mode2);

extern INT8 parse_speed_2_1013(struct tag_head *tag, speed_2 *speed2);

extern INT8 parse_swing_2_1015(struct tag_head *tag, swing_2 *swing2, UINT16 swing_count);

#endif

extern INT8 parse_function_2_1016(struct tag_head *tag, function_2 *function2);

extern INT8 parse_swing_info_1506(struct tag_head *tag, swing_info *si);

extern INT8 parse_solo_code_1009(struct tag_head *tag, solo_code *sc);

#ifdef __cplusplus
}
#endif

#endif // _IRDA_PARSE_AC_PARAMETER_H_