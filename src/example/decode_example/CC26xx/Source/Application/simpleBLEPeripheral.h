/**************************************************************************************
Filename:       simpleBLEPeripheral.h
Revised:        Date: 2017-01-10
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode (status type)

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************/

#ifndef SIMPLEBLEPERIPHERAL_H
#define SIMPLEBLEPERIPHERAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */

/*********************************************************************
*  EXTERNAL VARIABLES
*/

/*********************************************************************
 * CONSTANTS
 */

/*********************************************************************
 * MACROS
 */

/* IREXT - begin */

#include "./irext/include/ir_decode.h"

// UART associated definitions
#define HEADER_SR  0x30
#define HEADER_BT  0x31
#define HEADER_CMD 0x32

#define CATEGORY_LENGTH_SIZE 1
#define BINARY_LENGTH_SIZE   4

// IR associated definitions
#define BINARY_SOURCE_SIZE_MAX 1024

#define IR_KEY_POWER    0
#define IR_KEY_MUTE     1
#define IR_KEY_VOL_UP   7
#define IR_KEY_VOL_DOWN 8


typedef enum
{
    IR_TYPE_NONE = 0,
    IR_TYPE_TV,
    IR_TYPE_AC,
    IR_TYPE_MAX
} ir_type_t;

typedef enum
{
    IR_STATE_NONE = 0,
    IR_STATE_OPENED,
    IR_STATE_PARSED,
    IR_STATE_MAX
} ir_state_t;

typedef struct
{
    int32_t binary_recv_length;
    int32_t binary_recv_expected_length;
    uint8_t transfer_on_going;
} transfer_control_block;

typedef struct
{
    ir_type_t ir_type;
    ir_state_t ir_state;
    uint8_t source_code[BINARY_SOURCE_SIZE_MAX];
    uint16_t source_code_length;
    uint16_t ir_decoded[USER_DATA_SIZE];
    uint16_t decoded_length;
} decode_control_block;

/* IREXT - end */


/*********************************************************************
 * FUNCTIONS
 */

/*
 * Task creation function for the Simple BLE Peripheral.
 */
extern void SimpleBLEPeripheral_createTask(void);


/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* SIMPLEBLEPERIPHERAL_H */
