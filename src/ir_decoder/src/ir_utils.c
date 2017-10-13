/**************************************************************************************
Filename:       ir_utils.c
Revised:        Date: 2016-10-26
Revision:       Revision: 1.0

Description:    This file provides generic utils for IRDA algorithms

Revision log:
* 2016-10-01: created by strawmanbobi
**************************************************************************************/

#include "../include/ir_utils.h"

UINT8 char_to_hex(char chr)
{
    UINT8 value = 0;
    if (chr >= '0' && chr <= '9')
        value = (UINT8) (chr - '0');
    if (chr >= 'a' && chr <= 'f')
        value = (UINT8) (chr - 'a' + 10);
    if (chr >= 'A' && chr <= 'F')
        value = (UINT8) (chr - 'A' + 10);
    return value;
}

UINT8 chars_to_hex(const UINT8 *p)
{
    return (char_to_hex(*p) << 4) + char_to_hex(*(p + 1));
}

void string_to_hex_common(UINT8 *p, UINT8 *hex_data, UINT16 len)
{
    // in condition of hex_code is already assigned
    UINT16 i = 0;

    for (i = 0; i < len; i++)
    {
        hex_data[i] = chars_to_hex(p);
        p = p + 2;
    }
}

void string_to_hex(UINT8 *p, t_ac_hex *pac_hex)
{
    UINT8 i = 0;

    pac_hex->len = chars_to_hex(p);
    p = p + 2;
    for (i = 0; i < pac_hex->len; i++)
    {
        pac_hex->data[i] = chars_to_hex(p);
        p = p + 2;
    }
}

BOOL is_in(const UINT8 *array, UINT8 value, UINT8 len)
{
    UINT16 i = 0;
    for (i = 0; i < len; i++)
    {
        if (array[i] == value)
        {
            return TRUE;
        }
    }
    return FALSE;
}