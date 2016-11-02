/**************************************************************************************************
Filename:       bc_parse_parameter.c
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
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "irda_defs.h"
#include "irda_utils.h"
#include "bc_parse_parameter.h"

/*
 * global vars
 */

/*
 * external vars
 */

/*
 * function declaration
 */
INT8 parse_ble_command(UINT8 *data, UINT16 *trav_offset, t_bc_command *bc_command);

/*
 * function definition
 */

INT8 parse_ble_name(UINT8 *data, UINT8 length, char *name)
{
    if (NULL == data || NULL == name || 0 == length)
    {
        return IR_DECODE_FAILED;
    }
    irda_memcpy(name, data, length);
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_ble_need_conn_ack(UINT8 *data, UINT8 *nca)
{
    if (NULL == data || NULL == nca)
    {
        return IR_DECODE_FAILED;
    }

    if (*data == '0')
    {
        *nca = 0;
    }
    else if (*data == '1')
    {
        *nca = 1;
    }
    else
    {
        *nca = 0;
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_ble_name_essential_length(UINT8 *data, UINT8 *nel)
{
    if (NULL == data || NULL == nel)
    {
        return IR_DECODE_FAILED;
    }

    // must be 2 bytes
    *nel = ((data[0] - '0') * 10) + (data[1] - '0');

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_ble_name_length(UINT8 *data, UINT8 *nl)
{
    if (NULL == data || NULL == nl)
    {
        return IR_DECODE_FAILED;
    }

    // must be 2 bytes
    *nl = ((data[0] - '0') * 10) + (data[1] - '0');

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_ble_command(UINT8 *data, UINT16 *trav_offset, t_bc_command *bc_command)
{
    UINT8 command_len = 0;

    if (NULL == data || NULL == bc_command || NULL == trav_offset)
    {
        return IR_DECODE_FAILED;
    }

    command_len = data[*trav_offset];

    if (0 == command_len || command_len > BLE_GAP_MTU)
    {
        // reset data structure of bc_command in case of invalid command_len is found
        bc_command->length = 0;
        bc_command->handle = 0x0000;
        irda_memset(bc_command->command, 0x00, BLE_GAP_MTU);
        return IR_DECODE_SUCCEEDED;
    }
    bc_command->length = command_len;
    (*trav_offset)++;

    bc_command->handle = data[*trav_offset] * 0x0100;
    (*trav_offset)++;
    bc_command->handle += data[*trav_offset];
    (*trav_offset)++;

    // prepare commands
    irda_memset(bc_command->command, 0x00, BLE_GAP_MTU);
    irda_memcpy(bc_command->command, &data[*trav_offset], bc_command->length);
    (*trav_offset) += bc_command->length;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_ble_commands(t_tag_head *tag, t_bc_commands *bc_commands)
{
    UINT16 hex_len = 0;
#if (defined BOARD_PC) || (defined BOARD_MT6580)
    UINT16 i = 0;
#endif
    UINT16 trav_offset = 0;
    UINT8 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag || NULL == bc_commands)
    {
        return IR_DECODE_FAILED;
    }

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);
    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    bc_commands->seg_count = hex_data[0];
    bc_commands->commands = (t_bc_command*)irda_malloc(bc_commands->seg_count * sizeof(t_bc_command));

    for (seg_index = 0; seg_index < bc_commands->seg_count; seg_index++)
    {
        // trav_offset + 1 indicates the cursor pointing to internal data slice marked by trav_offset, considering
        // the total length of a single byte
        if (IR_DECODE_FAILED == parse_ble_command(&hex_data[trav_offset + 1],
                                                  &trav_offset,
                                                  &bc_commands->commands[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }
#if (defined BOARD_PC) || (defined BOARD_MT6580)
        IR_PRINTF("command length = %d\n", bc_commands->commands[seg_index].length);
        IR_PRINTF("command handle = 0x%02x\n", bc_commands->commands[seg_index].handle);
        for(i = 0; i < bc_commands->commands[seg_index].length; i++)
        {
            IR_PRINTF("[%02X] ", bc_commands->commands[seg_index].command[i]);
        }
        IR_PRINTF("\n");
#endif
        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}