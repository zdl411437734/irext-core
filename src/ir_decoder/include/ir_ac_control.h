/**************************************************************************************************
Filename:       irda_ac_control.h
Revised:        Date: 2016-12-31
Revision:       Revision: 1.0

Description:    This file provides methods for AC IR control

Revision log:
* 2016-10-12: created by strawmanbobi
**************************************************************************************************/
#ifndef IRDA_DECODER_IR_AC_CONTROL_H
#define IRDA_DECODER_IR_AC_CONTROL_H

#ifdef __cplusplus
extern "C"
{
#endif

#include "ir_defs.h"

extern INT8 irda_ac_lib_parse();

extern INT8 free_ac_context();

extern BOOL is_solo_function(UINT8 function_code);

#ifdef __cplusplus
}
#endif

#endif //IRDA_DECODER_IR_AC_CONTROL_H
