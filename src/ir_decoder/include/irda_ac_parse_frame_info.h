/**************************************************************************************************
Filename:       irda_parse_frame_parameter.h
Revised:        Date: 2016-10-11
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for AC frame parameters

Revision log:
* 2016-10-11: created by strawmanbobi
**************************************************************************************************/

#ifndef _IRDA_PARSE_FRAME_PARAMETER_H_
#define _IRDA_PARSE_FRAME_PARAMETER_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include "irda_decode.h"

extern INT8 parse_bootcode(struct tag_head *tag);

extern INT8 parse_zero(struct tag_head *tag);

extern INT8 parse_one(struct tag_head *tag);

extern INT8 parse_delaycode(struct tag_head *tag);

extern INT8 parse_framelen(struct tag_head *tag, UINT16 len);

extern INT8 parse_endian(struct tag_head *tag);

extern INT8 parse_lastbit(struct tag_head *tag);

extern INT8 parse_repeat_times(struct tag_head *tag);

extern INT8 parse_bitnum(struct tag_head *tag);

#ifdef __cplusplus
	}
#endif

#endif // _IRDA_PARSE_FRAME_PARAMETER_H_