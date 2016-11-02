/**************************************************************************************************
Filename:       irda_parse_frame_parameter.h
Revised:        Date: 2015-08-11
Revision:       Revision: 1.0

Description:    This file provides algorithms for UCON IR decode for AC frame parameters

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2015-08-11: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "ucon_decode.h"

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