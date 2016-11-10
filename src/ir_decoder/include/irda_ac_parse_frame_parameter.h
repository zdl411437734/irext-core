/**************************************************************************************************
Filename:       irda_parse_frame_parameter.h
Revised:        Date: 2016-10-11
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for AC frame parameters

Revision log:
* 2016-10-11: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "irda_decode.h"

#ifndef _IRDA_PARSE_FRAME_PARAMETER_H_
#define _IRDA_PARSE_FRAME_PARAMETER_H_

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
extern INT8 parse_bootcode_300(struct tag_head *tag);

extern INT8 parse_zero_301(struct tag_head *tag);

extern INT8 parse_one_302(struct tag_head *tag);

extern INT8 parse_delaycode_303(struct tag_head *tag);

extern INT8 parse_framelen_304(struct tag_head *tag, UINT16 len);

extern INT8 parse_endian_306(struct tag_head *tag);

extern INT8 parse_lastbit_307(struct tag_head *tag);

extern INT8 parse_repeat_times_1508(struct tag_head *tag);

extern INT8 parse_bitnum_1509(struct tag_head *tag);

#ifdef __cplusplus
	}
#endif

#endif // _IRDA_PARSE_FRAME_PARAMETER_H_