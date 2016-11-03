/**************************************************************************************************
Filename:       irda_apply.h
Revised:        Date: 2015-08-12
Revision:       Revision: 1.0

Description:    This file provides methods for AC IR applying functionalities



Revision log:
* 2015-08-12: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "irda_decode.h"

#ifndef _IRDA_APPLY_H_
#define _IRDA_APPLY_H_

#ifdef __cplusplus
extern "C"
{
#endif

/*
 * public macros
 */
#define MIN_TAG_LENGTH_TYPE_1   4
#define MIN_TAG_LENGTH_TYPE_2   6

/*
 * public type definition
 */

/*
 * public function declaration
 */
extern INT8 apply_ac_power(struct ac_protocol *protocol, UINT8 power_status);

extern INT8 apply_ac_mode(struct ac_protocol *protocol, UINT8 mode_status);

extern INT8 apply_ac_temperature(struct ac_protocol *protocol, UINT8 temperature);

extern INT8 apply_ac_wind_speed(struct ac_protocol *protocol, UINT8 wind_speed);

extern INT8 apply_ac_swing(struct ac_protocol *protocol, UINT8 swing_status);

extern INT8 apply_ac_function(struct ac_protocol *protocol, UINT8 function);

extern INT8 apply_checksum(struct ac_protocol *protocol);

#ifdef __cplusplus
}
#endif

#endif //_IRDA_APPLY_H_