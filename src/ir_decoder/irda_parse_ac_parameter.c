/**************************************************************************************************
Filename:       irda_parse_ac_parameter.c
Revised:        Date: 2015-08-12
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for AC functionality parameters



Revision log:
* 2015-08-12: created by strawmanbobi
**************************************************************************************************/
/*
 *inclusion
 */
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "irda_utils.h"
#include "irda_parse_ac_parameter.h"
#include "irda_decode.h"

/*
 * global vars
 */

/*
 * external vars
 */

/*
 * function declaration
 */

/*
 * function definition
 */
INT8 parse_comp_data_type_1(UINT8 *data, UINT16 *trav_offset, tag_comp *comp)
{
    UINT8 seg_len = data[*trav_offset];
    (*trav_offset)++;

    if (0 == seg_len)
    {
        // do alloc memory to this power segment and return SUCCESS
        comp->seg_len = 0;
        comp->segment = NULL;
        return IR_DECODE_SUCCEEDED;
    }

    comp->seg_len = seg_len;
    comp->segment = (UINT8 *) irda_malloc(seg_len);
    if (NULL == comp->segment)
    {
        return IR_DECODE_FAILED;
    }

    irda_memcpy(comp->segment, &data[*trav_offset], seg_len);
    *trav_offset += seg_len;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_comp_data_type_2(UINT8 *data, UINT16 *trav_offset, tag_comp *comp)
{
    UINT8 seg_len = data[*trav_offset];
    (*trav_offset)++;

    if (0 == seg_len)
    {
        // do alloc memory to this temp segment and return SUCCESS
        comp->seg_len = 0;
        comp->segment = NULL;
        return IR_DECODE_SUCCEEDED;
    }

    comp->seg_len = seg_len;
    comp->segment = (UINT8 *) irda_malloc(seg_len);
    if (NULL == comp->segment)
    {
        return IR_DECODE_FAILED;
    }

    irda_memcpy(comp->segment, &data[*trav_offset], seg_len);
    *trav_offset += seg_len;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_common_ac_parameter(t_tag_head *tag, tag_comp *comp_data, UINT8 with_end, UINT8 type)
{
    UINT16 hex_len = 0;
#if (defined BOARD_PC) || (defined BOARD_MT6580)
    UINT16 i = 0;
#endif
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == comp_data)
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

    // parse hex data to AC data structure
    //*comp_len = hex_len;

    if (AC_PARAMETER_TYPE_1 == type)
    {
        for (seg_index = 0; seg_index < with_end; seg_index++)
        {
            if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &comp_data[seg_index]))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
#if (defined BOARD_PC) || (defined BOARD_MT6580)
            // have some debug
            IR_PRINTF("seg[%d].len = %d : \n", seg_index, comp_data[seg_index].seg_len);
            for(i = 0; i < comp_data[seg_index].seg_len; i++)
            {
                IR_PRINTF("[%02X] ", comp_data[seg_index].segment[i]);
            }
            IR_PRINTF("\n");
#endif

            if (trav_offset >= hex_len)
            {
                break;
            }
        }
    }
    else
    {
        for (seg_index = 0; seg_index < with_end; seg_index++)
        {
            if (IR_DECODE_FAILED == parse_comp_data_type_2(hex_data, &trav_offset, &comp_data[seg_index]))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
#if (defined BOARD_PC) || (defined BOARD_MT6580)
            // have some debug
            IR_PRINTF("seg[%d].len = %d : \n", seg_index, comp_data[seg_index].seg_len);
            for(i = 0; i < comp_data[seg_index].seg_len; i++)
            {
                IR_PRINTF("[%02X] ", comp_data[seg_index].segment[i]);
            }
            IR_PRINTF("\n");
#endif
            if (trav_offset >= hex_len)
            {
                break;
            }
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_defaultcode_1002(struct tag_head *tag, ac_hex *default_code)
{
    UINT16 byteLen = 0;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    byteLen = tag->len >> 1;
    string_to_hex(tag->pdata, default_code, byteLen);

    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)

INT8 parse_power_1_1001(struct tag_head *tag, power_1 *power1)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == power1)
    {
        return IR_DECODE_FAILED;
    }
    // IR_PRINTF("\n============\n%s\n", __func__);

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    // parse hex data to power1 data structure
    power1->len = hex_len;

    for (seg_index = AC_POWER_ON; seg_index < AC_POWER_MAX; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &power1->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("power_seg[%d].len = %d : \n", seg_index, power1->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        // prevent from buffer over flowing
        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

#endif

INT8 parse_temp_1_1003(struct tag_head *tag, temp_1 *temp1)
{
    UINT16 hex_len = 0;
    UINT16 i = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
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

    // parse hex data according to length
    if (hex_data[0] == hex_len - 1)
    {
        // dynamic temperature tag
        temp1->type = TEMP_TYPE_DYNAMIC;
        temp1->len = hex_len;
        UINT8 seg_len = hex_data[0];

        for (seg_index = AC_TEMP_16; seg_index < AC_TEMP_MAX; seg_index++)
        {
            // 020210 indicates set the 02nd byte to [default] +10, +11, +12, +...
            temp1->comp_data[seg_index].seg_len = seg_len;
            temp1->comp_data[seg_index].segment = (UINT8 *) irda_malloc(seg_len);
            if (NULL == temp1->comp_data[seg_index].segment)
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }

            for (i = 1; i < seg_len; i += 2)
            {
                temp1->comp_data[seg_index].segment[i - 1] = hex_data[i];

                // get the default value of temperature
                temp1->comp_data[seg_index].segment[i] = hex_data[i + 1] * seg_index;
            }
        }
    }
    else
    {
        // static temperature tag
        temp1->len = hex_len;
        temp1->type = TEMP_TYPE_STATIC;
        for (seg_index = AC_TEMP_16; seg_index < AC_TEMP_MAX; seg_index++)
        {
            if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &temp1->comp_data[seg_index]))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }

#if (defined BOARD_PC) || (defined BOARD_MT6580)
            // have some debug
            IR_PRINTF("seg[%d].len = %d : \n", seg_index, temp1->comp_data[seg_index].seg_len);
            for(i = 0; i < temp1->comp_data[seg_index].seg_len; i++)
            {
                IR_PRINTF("[%02X] ", temp1->comp_data[seg_index].segment[i]);
            }
            IR_PRINTF("\n");
#endif

            if (trav_offset >= hex_len)
            {
                break;
            }
        }
    }
    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)

INT8 parse_mode_1_1004(struct tag_head *tag, mode_1 *mode1)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    // IR_PRINTF("\n============\n%s\n", __func__);

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    // parse hex data to mode1 data structure
    mode1->len = hex_len;

    for (seg_index = AC_MODE_COOL; seg_index < AC_MODE_MAX; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &mode1->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("mode_seg[%d].len = %d : \n", seg_index, mode1->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_speed_1_1005(struct tag_head *tag, speed_1 *speed1)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    // IR_PRINTF("\n============\n%s\n", __func__);

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    // parse hex data to speed1 data structure
    speed1->len = hex_len;

    for (seg_index = AC_WS_AUTO; seg_index < AC_WS_MAX; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &speed1->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("speed_seg[%d].len = %d : \n", seg_index, speed1->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_swing_1_1007(struct tag_head *tag, swing_1 *swing1, UINT16 swing_count)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    // IR_PRINTF("\n============\n%s\n", __func__);

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    // parse hex data to swing1 data structure
    swing1->count = swing_count;
    swing1->len = hex_len;
    swing1->comp_data = (tag_comp *) irda_malloc(sizeof(tag_comp) * swing_count);
    if (NULL == swing1->comp_data)
    {
        irda_free(hex_data);
        hex_data = NULL;
        return IR_DECODE_FAILED;
    }

    for (seg_index = 0; seg_index < swing_count; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_1(hex_data, &trav_offset, &swing1->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("swing_seg[%d].len = %d : \n", seg_index, swing1->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

#endif

/* modified by xiangjiang 2015-11-20 - begin - */
INT8 parse_checksum_byte_typed(UINT8 *csdata, tag_checksum_data *checksum, UINT16 len)
{
    checksum->start_byte_pos = csdata[2];
    checksum->end_byte_pos = csdata[3];
    checksum->checksum_byte_pos = csdata[4];

    if (len > 5)
    {
        checksum->checksum_plus = csdata[5];
    }
    else
    {
        checksum->checksum_plus = 0;
    }
    checksum->spec_pos = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_checksum_half_byte_typed(UINT8 *csdata, tag_checksum_data *checksum, UINT16 len)
{
    checksum->start_byte_pos = csdata[2];
    checksum->end_byte_pos = csdata[3];
    checksum->checksum_byte_pos = csdata[4];

    if (len > 5)
    {
        checksum->checksum_plus = csdata[5];
    }
    else
    {
        checksum->checksum_plus = 0;
    }
    checksum->spec_pos = NULL;
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_checksum_spec_half_byte_typed(UINT8 *csdata, tag_checksum_data *checksum, UINT16 len)
{
    /*
     * note:
     * for the type of specified half byte checksum algorithm,
     * the checksum byte positions are in unit of HALF BYTE, rather than in unit of BYTE
     * as well as the specified half byte positions (spec_pos).
     * Thus the specified half byte checksum only affects 4 bits of a position
     * of half byte specified by check_sum_byte_pos property.
     */
    UINT16 spec_pos_size = len - 4;

    checksum->checksum_byte_pos = csdata[2];
    checksum->checksum_plus = csdata[3];
    checksum->start_byte_pos = 0;
    checksum->end_byte_pos = 0;
    checksum->spec_pos = (UINT8 *) irda_malloc(spec_pos_size);
    if (NULL == checksum->spec_pos)
    {
        return IR_DECODE_FAILED;
    }
    irda_memcpy(checksum->spec_pos, &csdata[4], spec_pos_size);

    return IR_DECODE_SUCCEEDED;
}
/* modified by xiangjiang 2015-11-20 - end - */

/* added by xiangjiang 2015-11-20 - begin - */
INT8 parse_checksum_1008_malloc(struct tag_head *tag, tchecksum *checksum)
{
    UINT8 i = 0;
    UINT8 cnt = 0;

    for (i = 0; i < tag->len; i++)
    {
        if (tag->pdata[i] == '|')
        {
            cnt++;
        }
    }

    checksum->len = (tag->len - cnt) >> 1;
    checksum->count = cnt + 1;
    checksum->checksum_data = (tag_checksum_data*) irda_malloc(sizeof(tag_checksum_data) * checksum->count);

    if (NULL == checksum->checksum_data)
    {
        return IR_DECODE_FAILED;
    }
    irda_memset(checksum->checksum_data, 0x00, sizeof(tag_checksum_data) * checksum->count);

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_checksum_1008_data(UINT8 *buf, tag_checksum_data *checksum, UINT8 length)
{
    UINT8 *hex_data = NULL;
    UINT16 hex_len = 0;

    if (NULL == buf)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == checksum)
    {
        return IR_DECODE_FAILED;
    }

    hex_len = length;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(buf, hex_data, hex_len);

#if (defined BOARD_PC) || (defined BOARD_MT6580)
    UINT8 i = 0;
    IR_PRINTF("hex len = %d\n", hex_len);
    for(i = 0; i < hex_len; i++)
    {
        IR_PRINTF("[%02X] ", hex_data[i]);
    }
    IR_PRINTF("\n");
#endif

    if (length != hex_data[0] + 1)
    {
        irda_free(hex_data);
        hex_data = NULL;
        return IR_DECODE_FAILED;
    }

    checksum->len = hex_data[0];
    checksum->type = hex_data[1];
    switch (checksum->type)
    {
        case CHECKSUM_TYPE_BYTE:
        case CHECKSUM_TYPE_BYTE_INVERSE:
            if (IR_DECODE_FAILED == parse_checksum_byte_typed(hex_data, checksum, hex_len))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
            break;
        case CHECKSUM_TYPE_HALF_BYTE:
        case CHECKSUM_TYPE_HALF_BYTE_INVERSE:
            if (IR_DECODE_FAILED == parse_checksum_half_byte_typed(hex_data, checksum, hex_len))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
            break;
        case CHECKSUM_TYPE_SPEC_HALF_BYTE:
        case CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE:
        case CHECKSUM_TYPE_SPEC_HALF_BYTE_ONE_BYTE:
        case CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE_ONE_BYTE:
            if (IR_DECODE_FAILED == parse_checksum_spec_half_byte_typed(hex_data, checksum, hex_len))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
            break;
        default:
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
            break;
    }

    irda_free(hex_data);
    hex_data = NULL;
    return IR_DECODE_SUCCEEDED;
}
/* added by xiangjiang 2015-11-20 - end - */

INT8 parse_checksum_1008(struct tag_head *tag, tchecksum *checksum)
{
/* modified by xiangjiang 2015-11-20 - begin - */
#if 0
    UINT8 *hex_data = NULL;
    UINT16 hex_len = 0;

    hex_len = tag->len >> 1;
    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }

    string_to_hex_common(tag->pdata, hex_data, hex_len);

    if (tag->len >> 1 != hex_data[0] + 1)
    {
        irda_free(hex_data);
        hex_data = NULL;
        return IR_DECODE_FAILED;
    }

    checksum->len = hex_data[0];
    checksum->type = hex_data[1];
    switch (checksum->type)
    {
        case CHECKSUM_TYPE_BYTE:
        case CHECKSUM_TYPE_BYTE_INVERSE:
            parse_checksum_byte_typed(hex_data, checksum, hex_len);
            break;
        case CHECKSUM_TYPE_HALF_BYTE:
        case CHECKSUM_TYPE_HALF_BYTE_INVERSE:
            parse_checksum_half_byte_typed(hex_data, checksum, hex_len);
            break;
        case CHECKSUM_TYPE_SPEC_HALF_BYTE:
        case CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE:
            parse_checksum_spec_half_byte_typed(hex_data, checksum, hex_len);
            break;
        default:
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
    }

    irda_free(hex_data);
    hex_data = NULL;

#else
    UINT8 i = 0;
    UINT8 num = 0;
    UINT16 preindex = 0;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == checksum)
    {
        return IR_DECODE_FAILED;
    }

    if(IR_DECODE_FAILED == parse_checksum_1008_malloc(tag, checksum))
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < tag->len; i++)
    {
        if (tag->pdata[i] == '|')
        {
            if(IR_DECODE_FAILED == parse_checksum_1008_data(tag->pdata + preindex,
                                                            checksum->checksum_data + num,
                                                            (i - preindex) >> 1))
            {
                return IR_DECODE_FAILED;
            }
            preindex = i + 1;
            num++;
        }
    }

    if(IR_DECODE_FAILED == parse_checksum_1008_data(tag->pdata + preindex,
                                                    checksum->checksum_data + num,
                                                    (i - preindex) >> 1))
    {
        return IR_DECODE_FAILED;
    }

#if (defined BOARD_PC) || (defined BOARD_MT6580)
    UINT8 j = 0;
    for(i = 0; i < checksum->count; i++)
    {
        IR_PRINTF("checksum[%d].len = 1 + %d :\n", i, checksum->checksum_data[i].len);
        for(j = 0; j <= checksum->checksum_data[i].len; j++)
        {
            IR_PRINTF("[%02X] ", *(((UINT8*)&checksum->checksum_data[i]) + j));
            if(j == 0)
            {
                IR_PRINTF(" ");
            }
        }
        IR_PRINTF("\n");
    }
#endif

#endif
/* modified by xiangjiang 2015-11-20 - end - */

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_function_1(UINT8 *data, UINT16 *trav_offset, tag_comp *mode_seg)
{
    UINT8 seg_len = 0;
    BOOL valid_function_id = TRUE;

    if (NULL == data)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == trav_offset)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == mode_seg)
    {
        return IR_DECODE_FAILED;
    }

    seg_len = data[*trav_offset];
    (*trav_offset)++;

    // function id starts from 1 (POWER)
    UINT8 function_id = data[*trav_offset] - 1;

    if (function_id > AC_FUNCTION_MAX - 1)
    {
        // ignore unsupported function ID
        IR_PRINTF("\nunsupported function id : %d\n", function_id);
        valid_function_id = FALSE;
    }

    (*trav_offset)++;

    if (0 == seg_len)
    {
        // do alloc memory to this mode segment and return SUCCESS
        if (TRUE == valid_function_id)
        {
            mode_seg[function_id].seg_len = 0;

            if (NULL != mode_seg[function_id].segment)
            {
                irda_free(mode_seg[function_id].segment);
                mode_seg[function_id].segment = NULL;
            }
        }

        return IR_DECODE_SUCCEEDED;
    }

    if (TRUE == valid_function_id)
    {
        mode_seg[function_id].seg_len = seg_len - 1;
        mode_seg[function_id].segment = (UINT8 *) irda_malloc(seg_len - 1);
        if (NULL == mode_seg[function_id].segment)
        {
            return IR_DECODE_FAILED;
        }
        irda_memcpy(mode_seg[function_id].segment, &data[*trav_offset], seg_len - 1);
    }
    *trav_offset += seg_len - 1;

    return function_id;
}

INT8 parse_function_1_1010(struct tag_head *tag, function_1 *function1)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == function1)
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

    // parse hex data to mode1 data structure
    function1->len = hex_len;

    // seg_index in TAG 1010 and TAG 1016 only refers to functional count
    for (seg_index = AC_FUNCTION_POWER; seg_index < AC_FUNCTION_MAX; seg_index++)
    {
        int fid = parse_function_1(hex_data, &trav_offset, &function1->comp_data[0]);

        /*
        if (fid > AC_FUNCTION_MAX - 1)
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }
        */

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_temp_2_1011(struct tag_head *tag, temp_2 *temp2)
{
    UINT16 hex_len = 0;
    UINT16 i = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == temp2)
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

    // parse hex data according to length
    if (hex_data[0] == hex_len - 1)
    {
        // dynamic temperature tag
        temp2->type = TEMP_TYPE_DYNAMIC;
        temp2->len = hex_len;
        UINT8 seg_len = hex_data[0];

        for (seg_index = AC_TEMP_16; seg_index < AC_TEMP_MAX; seg_index++)
        {
            // 020210 indicates set the 02nd byte to [default] +10, +11, +12, +...
            temp2->comp_data[seg_index].seg_len = seg_len;
            temp2->comp_data[seg_index].segment = (UINT8 *) irda_malloc(seg_len);
            if (NULL == temp2->comp_data[seg_index].segment)
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }
            for (i = 2; i < seg_len; i += 3)
            {
                temp2->comp_data[seg_index].segment[i - 2] = hex_data[i - 1];
                temp2->comp_data[seg_index].segment[i - 1] = hex_data[i];

                // for this second type (TAG 1011) temperature update, apply the change in run time.
                temp2->comp_data[seg_index].segment[i] = hex_data[i + 1] * seg_index;
            }

#if (defined BOARD_PC) || (defined BOARD_MT6580)
            // have some debug
            IR_PRINTF("seg[%d].len = %d : \n", seg_index, temp2->comp_data[seg_index].seg_len);
            for(i = 0; i < temp2->comp_data[seg_index].seg_len; i++)
            {
                IR_PRINTF("[%02X] ", temp2->comp_data[seg_index].segment[i]);
            }
            IR_PRINTF("\n");
#endif
        }
    }
    else
    {
        // static temperature tag
        temp2->len = hex_len;
        temp2->type = TEMP_TYPE_STATIC;
        for (seg_index = AC_TEMP_16; seg_index < AC_TEMP_MAX; seg_index++)
        {
            if (IR_DECODE_FAILED == parse_comp_data_type_2(hex_data, &trav_offset, &temp2->comp_data[seg_index]))
            {
                irda_free(hex_data);
                hex_data = NULL;
                return IR_DECODE_FAILED;
            }

            if (trav_offset >= hex_len)
            {
                break;
            }
        }
    }
    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)

INT8 parse_mode_2_1012(struct tag_head *tag, mode_2 *mode2)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    // IR_PRINTF("\n============\n%s\n", __func__);
    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == mode2)
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

    // parse hex data to mode1 data structure
    mode2->len = hex_len;

    for (seg_index = AC_MODE_COOL; seg_index < AC_MODE_MAX; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_2(hex_data, &trav_offset, &mode2->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("mode_seg[%d].len = %d : \n", seg_index, mode2->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_speed_2_1013(struct tag_head *tag, speed_2 *speed2)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    // IR_PRINTF("\n============\n%s\n", __func__);
    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == speed2)
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

    // parse hex data to speed1 data structure
    speed2->len = hex_len;

    for (seg_index = AC_WS_AUTO; seg_index < AC_WS_MAX; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_2(hex_data, &trav_offset, &speed2->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("speed_seg[%d].len = %d : \n", seg_index, speed2->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_swing_2_1015(struct tag_head *tag, swing_2 *swing2, UINT16 swing_count)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    // IR_PRINTF("\n============\n%s\n", __func__);
    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == swing2)
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

    // parse hex data to swing2 data structure
    swing2->count = swing_count;
    swing2->len = hex_len;
    swing2->comp_data = (tag_comp *) irda_malloc(sizeof(tag_comp) * swing_count);
    if (NULL == swing2->comp_data)
    {
        irda_free(hex_data);
        hex_data = NULL;
        return IR_DECODE_FAILED;
    }

    for (seg_index = 0; seg_index < swing_count; seg_index++)
    {
        if (IR_DECODE_FAILED == parse_comp_data_type_2(hex_data, &trav_offset, &swing2->comp_data[seg_index]))
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }

        // have some debug
        // IR_PRINTF("swing_seg[%d].len = %d : \n", seg_index, swing2->comp_data[seg_index].seg_len);
        // IR_PRINTF("\n");

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

#endif

INT8 parse_function_2(UINT8 *data, UINT16 *trav_offset, tag_comp *mode_seg)
{
    UINT8 seg_len = 0;
    BOOL valid_function_id = TRUE;

    if (NULL == data)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == trav_offset)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == mode_seg)
    {
        return IR_DECODE_FAILED;
    }

    seg_len = data[*trav_offset];
    (*trav_offset)++;

    // function id starts from 1 (POWER)
    UINT8 function_id = data[*trav_offset] - 1;
    if (function_id > AC_FUNCTION_MAX - 1)
    {
        // ignore unsupported function ID
        IR_PRINTF("\nunsupported function id : %d\n", function_id);
        valid_function_id = FALSE;
    }

    (*trav_offset)++;

    if (0 == seg_len)
    {
        if (TRUE == valid_function_id)
        {
            // do alloc memory to this mode segment and return SUCCESS
            mode_seg[function_id].seg_len = 0;

            if (NULL != mode_seg[function_id].segment)
            {
                irda_free(mode_seg[function_id].segment);
                mode_seg[function_id].segment = NULL;
            }
        }

        return IR_DECODE_SUCCEEDED;
    }

    if (TRUE == valid_function_id)
    {
        mode_seg[function_id].seg_len = seg_len - 1;
        mode_seg[function_id].segment = (UINT8 *) irda_malloc(seg_len - 1);

        if (NULL == mode_seg[function_id].segment)
        {
            return IR_DECODE_FAILED;
        }

        irda_memcpy(mode_seg[function_id].segment, &data[*trav_offset], seg_len - 1);
    }
    *trav_offset += seg_len - 1;

    return function_id;
}

INT8 parse_function_2_1016(struct tag_head *tag, function_2 *function2)
{
    UINT16 hex_len = 0;
    UINT16 trav_offset = 0;
    UINT16 seg_index = 0;
    UINT8 *hex_data = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == function2)
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

    // parse hex data to mode1 data structure
    function2->len = hex_len;

    // seg_index in TAG 1010 and TAG 1016 only refers to functional count
    for (seg_index = AC_FUNCTION_POWER; seg_index < AC_FUNCTION_MAX; seg_index++)
    {
        UINT8 fid = parse_function_2(hex_data, &trav_offset, &function2->comp_data[0]);

        /*
        if (fid > AC_FUNCTION_MAX - 1)
        {
            irda_free(hex_data);
            hex_data = NULL;
            return IR_DECODE_FAILED;
        }
        */

        if (trav_offset >= hex_len)
        {
            break;
        }
    }

    irda_free(hex_data);
    hex_data = NULL;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_swing_info_1506(struct tag_head *tag, swing_info *si)
{
    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == si)
    {
        return IR_DECODE_FAILED;
    }
    /*
     * 0 or 1 only - indicates swing info
     */
    if (1 == tag->len)
    {
        if ('0' == tag->pdata[0])
        {
            // to identify if there is only 1 status in TAG 1007 OR 1015
            si->type = SWING_TYPE_NOT_SPECIFIED;
            si->mode_count = 0;
        }
        else if ('1' == tag->pdata[0])
        {
            si->type = SWING_TYPE_SWING_ONLY;
            si->mode_count = 1;
        }
        else
        {
            return IR_DECODE_FAILED;
        }
        return IR_DECODE_SUCCEEDED;
    }

    /*
     * length greater than 1 indicates both auto-swing and some swing angles are supported
     */
    // count how many swing types are there
    si->type = SWING_TYPE_NORMAL;
    si->mode_count = (tag->len + 1) >> 1;

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_solo_code_1009(struct tag_head *tag, solo_code *sc)
{
    UINT16 hex_len = 0;
    UINT8 *hex_data = NULL;
    UINT8 i = 0;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == sc)
    {
        return IR_DECODE_FAILED;
    }

    hex_len = tag->len >> 1;

    if(hex_len > AC_FUNCTION_MAX)
    {
        IR_PRINTF("solo function code exceeded!!\n");
        return IR_DECODE_FAILED;
    }

    hex_data = (UINT8 *) irda_malloc(hex_len);

    if (NULL == hex_data)
    {
        return IR_DECODE_FAILED;
    }
    string_to_hex_common(tag->pdata, hex_data, hex_len);

    // parse hex data to mode1 data structure
    sc->len = hex_len;
    sc->solo_func_count = hex_len - 1;

    // per each function takes just 1 byte of length
    sc->solo_func_count = hex_data[0];
    for (i = 1; i < hex_len; i++)
    {
        sc->solo_function_codes[i - 1] = hex_data[i];
    }

    irda_free(hex_data);
    hex_data = NULL;
    return IR_DECODE_SUCCEEDED;
}