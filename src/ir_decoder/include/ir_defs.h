/**************************************************************************************
Filename:       ir_defs.h
Revised:        Date: 2016-10-26
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************/

#ifndef PARSE_IR_DEFS_H
#define PARSE_IR_DEFS_H

#ifdef __cplusplus
extern "C"
{
#endif

#if defined BOARD_ANDROID
#include <android/log.h>
#define LOG_TAG "ir_decode"
#endif

#if defined BOARD_CC26XX
#include "OSAL.h"
#endif

#define TRUE    1
#define FALSE   0

typedef unsigned char UINT8;
typedef signed char INT8;
typedef unsigned short UINT16;
typedef signed short INT16;
typedef signed int INT;
typedef unsigned int UINT;
typedef int BOOL;

#if !defined BOARD_CC26XX
#define ir_malloc(A) malloc(A)
#define ir_free(A) free(A)
#else
#define ir_malloc(A) ICall_malloc(A)
#define ir_free(A) ICall_free(A)
#endif

#define ir_memcpy(A, B, C) memcpy(A, B, C)
#define ir_memset(A, B, C) memset(A, B, C)
#define ir_strlen(A) strlen(A)
#define ir_printf printf
#define USER_DATA_SIZE 1636

#ifdef __cplusplus
}
#endif
#endif //PARSE_IR_DEFS_H
