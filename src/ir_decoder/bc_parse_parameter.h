/**************************************************************************************************
Filename:       bc_parse_parameter.h
Revised:        Date: 2016-02-25
Revision:       Revision: 1.0

Description:    This file provides algorithms for UCON BLE Central decode

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2016-02-25: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "ucon_decode.h"

#ifndef _BC_PARSE_PARAMETER_H_
#define _BC_PARSE_PARAMETER_H_

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

extern INT8 parse_ble_name(UINT8 *data, UINT8 length, char *name);

extern INT8 parse_ble_need_conn_ack(UINT8 *data, UINT8 *nca);

extern INT8 parse_ble_name_essential_length(UINT8 *data, UINT8 *nel);

extern INT8 parse_ble_name_length(UINT8 *data, UINT8 *nl);

extern INT8 parse_ble_commands(t_tag_head *tag, t_bc_commands *bc_commands);

#ifdef __cplusplus
}
#endif

#endif // _IRDA_PARSE_AC_PARAMETER_H_