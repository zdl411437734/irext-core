/**************************************************************************************************
Filename:       irda_parse_forbidden_info.h
Revised:        Date: 2015-08-05
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for TAG 1002



Revision log:
* 2015-08-05: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include "irda_decode.h"

#ifndef _IRDA_PARSE_PARSE_150X_H_
#define _IRDA_PARSE_PARSE_150X_H_

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
extern INT8 parse_nmode_150x(struct tag_head *tag, ac_n_mode index);

#ifdef __cplusplus
	}
#endif

#endif // _IRDA_PARSE_PARSE_150X_H_

