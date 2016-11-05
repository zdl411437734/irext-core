/**************************************************************************************************
Filename:       irda_utils.c
Revised:        Date: 2016-10-26
Revision:       Revision: 1.0

Description:    This file provides generic utils for IRDA algorithms

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************************/
#include "irda_defs.h"
#include "irda_decode.h"

#ifndef _IRDA_UTILS_H_
#define _IRDA_UTILS_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdio.h>

extern void string_to_hex(UINT8 *p, ac_hex *pac_hex, UINT16 len);

extern void string_to_intArray(UINT8 *p, UINT8 *binary_code, UINT16 len);

extern void string_to_hex_common(UINT8 *p, UINT8 *hex_data, UINT16 len);

extern BOOL isin(UINT8 array[], UINT8 value, UINT8 len);

extern void hex_byte_to_double_char(char* dest, UINT8 length, UINT8 src);

#ifdef __cplusplus
}
#endif
#endif // _IRDA_UTILS_H_