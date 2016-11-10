/**************************************************************************************************
Filename:       irda_apply.c
Revised:        Date: 2016-10-12
Revision:       Revision: 1.0

Description:    This file provides methods for AC IR applying functionalities

Revision log:
* 2016-10-12: created by strawmanbobi
**************************************************************************************************/
/*
 *inclusion
 */

#include "include/irda_utils.h"
#include "include/irda_ac_apply.h"

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

INT8 apply_ac_parameter_type_1(UINT8 *dc_data, tag_comp *comp_data, UINT8 current_seg, UINT8 is_temp)
{
    if (0 != (comp_data->seg_len & 0x01))
    {
        return IR_DECODE_FAILED;
    }

    if (1 == is_temp)
    {
        dc_data[comp_data->segment[current_seg]] += comp_data->segment[current_seg + 1];
    }
    else
    {
        dc_data[comp_data->segment[current_seg]] = comp_data->segment[current_seg + 1];
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_parameter_type_2(UINT8 *dc_data, tag_comp *comp_data, UINT8 current_seg, UINT8 is_temp)
{
    UINT8 start_bit = 0;
    UINT8 end_bit = 0;
    UINT8 cover_byte_pos_hi = 0;
    UINT8 cover_byte_pos_lo = 0;
    UINT8 value;
    UINT8 move_bit = 0;

    if (0 != (comp_data->seg_len % 3))
    {
        return IR_DECODE_FAILED;
    }

    // TODO: to be validated
    start_bit = comp_data->segment[current_seg];
    end_bit = comp_data->segment[current_seg + 1];
    cover_byte_pos_hi = start_bit >> 3;
    cover_byte_pos_lo = (end_bit - 1) >> 3;
    if (cover_byte_pos_hi == cover_byte_pos_lo)
    {
        // cover_byte_pos_hi or cover_bytes_pos_lo is target byte to be applied with AC parameter
        // try get raw value of byte to be applied
        UINT8 raw_value = comp_data->segment[current_seg + 2];
        UINT8 int_start_bit = start_bit - (cover_byte_pos_hi << 3);
        UINT8 int_end_bit = end_bit - (cover_byte_pos_lo << 3);
        UINT8 bit_range = end_bit - start_bit;
        UINT8 mask = (0xFF << (8 - int_start_bit)) | (0xFF >> int_end_bit);
        UINT8 origin = dc_data[cover_byte_pos_lo];

        if (TRUE == is_temp)
        {
            move_bit = 8 - int_end_bit;
            value = (origin & mask) | (((((origin & ~mask) >> move_bit) + raw_value) << move_bit) & ~mask);
        }
        else
        {
            value = (origin & mask) | ((raw_value << (8 - int_start_bit - bit_range)) & ~mask);
        }
        dc_data[cover_byte_pos_lo] = value;
    }
    else
    {
        UINT8 value = 0x00;
        UINT8 origin_hi = 0x00;
        UINT8 origin_lo = 0x00;
        UINT8 mask_hi = 0x00;
        UINT8 mask_lo = 0x00;
        UINT8 raw_value = 0x00;
        UINT8 int_start_bit = 0x00;
        UINT8 int_end_bit = 0x00;

        if (cover_byte_pos_hi > cover_byte_pos_lo)
        {
            return IR_DECODE_FAILED;
        }
        // calculate the bit scope
        UINT8 bit_range = end_bit - start_bit;

		raw_value = comp_data->segment[current_seg + 2];
		origin_hi = dc_data[cover_byte_pos_hi];
		origin_lo = dc_data[cover_byte_pos_lo];

		int_start_bit = start_bit - (cover_byte_pos_hi << 3);
		int_end_bit = end_bit - (cover_byte_pos_lo << 3);

		mask_hi = 0xFF << (8 - int_start_bit);
		mask_lo = 0xFF >> int_end_bit;

        value = ((origin_hi & ~mask_hi) << int_end_bit) | ((origin_lo & ~mask_lo) >> (8 - int_end_bit));

        if (TRUE == is_temp)
        {
            raw_value += value;
        }

        dc_data[cover_byte_pos_hi] = (origin_hi & mask_hi) |
                                     (((0xFF >> (8 - bit_range)) & raw_value) >> int_end_bit);

        dc_data[cover_byte_pos_lo] = (origin_lo & mask_lo) |
                                     (((0xFF >> (8 - bit_range)) & raw_value) << (8 - int_end_bit));
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_power(struct ac_protocol *protocol, UINT8 power_status)
{
    UINT16 i = 0;
    if (0 == protocol->power1.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (0 == protocol->power1.comp_data[power_status].seg_len)
    {
        // force to apply power in any cases
        return IR_DECODE_SUCCEEDED;
    }
    for (i = 0; i < protocol->power1.comp_data[power_status].seg_len; i += 2)
    {
        apply_ac_parameter_type_1(ir_hex_code, &(protocol->power1.comp_data[power_status]), i, FALSE);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_mode(struct ac_protocol *protocol, UINT8 mode_status)
{
    UINT16 i = 0;

    if (0 == protocol->mode1.len)
    {
        goto try_applying_mode2;
    }

    if (0 == protocol->mode1.comp_data[mode_status].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->mode1.comp_data[mode_status].seg_len; i += 2)
    {
        apply_ac_parameter_type_1(ir_hex_code, &(protocol->mode1.comp_data[mode_status]), i, FALSE);
    }

    // get return here since wind mode 1 is already applied
    return IR_DECODE_SUCCEEDED;

    try_applying_mode2:
    if (0 == protocol->mode2.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (0 == protocol->mode2.comp_data[mode_status].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->mode2.comp_data[mode_status].seg_len; i += 3)
    {
        apply_ac_parameter_type_2(ir_hex_code,
                                  &(protocol->mode2.comp_data[mode_status]),
                                  i, FALSE);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_wind_speed(struct ac_protocol *protocol, UINT8 wind_speed)
{
    UINT16 i = 0;

    if (0 == protocol->speed1.len)
    {
        goto try_applying_wind_speed2;
    }

    if (0 == protocol->speed1.comp_data[wind_speed].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->speed1.comp_data[wind_speed].seg_len; i += 2)
    {
        apply_ac_parameter_type_1(ir_hex_code, &(protocol->speed1.comp_data[wind_speed]), i, FALSE);
    }

    // get return here since wind speed 1 is already applied
    return IR_DECODE_SUCCEEDED;

    try_applying_wind_speed2:
    if (0 == protocol->speed2.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (0 == protocol->speed2.comp_data[wind_speed].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->speed2.comp_data[wind_speed].seg_len; i += 3)
    {
        apply_ac_parameter_type_2(ir_hex_code,
                                  &(protocol->speed2.comp_data[wind_speed]),
                                  i, FALSE);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_temperature(struct ac_protocol *protocol, UINT8 temp_diff)
{
    UINT16 i = 0;

    if (0 == protocol->temp1.len)
    {
        goto try_applying_temp2;
    }

    if (0 == protocol->temp1.comp_data[temp_diff].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->temp1.comp_data[temp_diff].seg_len; i += 2)
    {
        if (TEMP_TYPE_DYNAMIC == protocol->temp1.type)
        {
            apply_ac_parameter_type_1(ir_hex_code, &(protocol->temp1.comp_data[temp_diff]), i, TRUE);
        }
        else if (TEMP_TYPE_STATIC == protocol->temp1.type)
        {
            apply_ac_parameter_type_1(ir_hex_code, &(protocol->temp1.comp_data[temp_diff]), i, FALSE);
        }
    }

    // get return here since temperature 1 is already applied
    return IR_DECODE_SUCCEEDED;

    try_applying_temp2:
    if (0 == protocol->temp2.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (0 == protocol->temp2.comp_data[temp_diff].seg_len)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->temp2.comp_data[temp_diff].seg_len; i += 3)
    {
        if(0 != protocol->temp2.comp_data[temp_diff].seg_len)
        {
            if (TEMP_TYPE_DYNAMIC == protocol->temp2.type)
            {
                apply_ac_parameter_type_2(ir_hex_code, &(protocol->temp2.comp_data[temp_diff]), i, TRUE);
            }
            else if (TEMP_TYPE_STATIC == protocol->temp2.type)
            {
                apply_ac_parameter_type_2(ir_hex_code, &(protocol->temp2.comp_data[temp_diff]), i, FALSE);
            }
        }
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_swing(struct ac_protocol *protocol, UINT8 swing_mode)
{
    UINT16 i = 0;

    if (0 == protocol->swing1.len)
    {
        goto try_applying_swing2;
    }

    if (swing_mode >= protocol->swing1.count)
    {
        return IR_DECODE_FAILED;
    }

    if (0 == protocol->swing1.comp_data[swing_mode].seg_len)
    {
        // swing does not have any empty data segment
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->swing1.comp_data[swing_mode].seg_len; i += 2)
    {
        apply_ac_parameter_type_1(ir_hex_code, &(protocol->swing1.comp_data[swing_mode]), i, FALSE);
    }

    // get return here since temperature 1 is already applied
    return IR_DECODE_SUCCEEDED;

    try_applying_swing2:
    if (0 == protocol->swing2.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (swing_mode >= protocol->swing2.count)
    {
        return IR_DECODE_FAILED;
    }

    if (0 == protocol->swing2.comp_data[swing_mode].seg_len)
    {
        // swing does not have any empty data segment
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < protocol->swing2.comp_data[swing_mode].seg_len; i += 3)
    {
        apply_ac_parameter_type_2(ir_hex_code,
                                  &(protocol->swing2.comp_data[swing_mode]),
                                  i, FALSE);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_ac_function(struct ac_protocol *protocol, UINT8 function)
{
    UINT16 i = 0;

    // function index starts from 1 (AC_FUNCTION_POWER), do -1 operation at first
    if (0 == protocol->function1.len)
    {
        goto try_applying_function2;
    }

    if (0 == protocol->function1.comp_data[function - 1].seg_len)
    {
        // force to apply function in any case
        return IR_DECODE_SUCCEEDED;
    }

    for (i = 0; i < protocol->function1.comp_data[function - 1].seg_len; i += 2)
    {
        apply_ac_parameter_type_1(ir_hex_code, &(protocol->function1.comp_data[function - 1]), i, FALSE);
    }

    // get return here since function 1 is already applied
    return IR_DECODE_SUCCEEDED;

    try_applying_function2:
    if (0 == protocol->function2.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    if (0 == protocol->function2.comp_data[function - 1].seg_len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    for (i = 0; i < protocol->function2.comp_data[function - 1].seg_len; i += 3)
    {
        apply_ac_parameter_type_2(ir_hex_code,
                                  &(protocol->function2.comp_data[function - 1]),
                                  i, FALSE);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_checksum_byte(UINT8 *ac_code, tag_checksum_data cs, BOOL inverse)
{
    UINT16 i = 0;
    UINT8 checksum = 0x00;

    if (cs.len < 3)
    {
        return IR_DECODE_SUCCEEDED;
    }

    for (i = cs.start_byte_pos; i < cs.end_byte_pos; i++)
    {
        checksum += ac_code[i];
    }

    checksum += cs.checksum_plus;

    if (TRUE == inverse)
    {
        checksum = ~checksum;
    }

    // apply checksum
    ac_code[cs.checksum_byte_pos] = checksum;

    IR_PRINTF("checksum value = %02X\n", checksum);
    IR_PRINTF("checksum byte pos = %d\n", cs.checksum_byte_pos);
    IR_PRINTF("\n");

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_checksum_halfbyte(UINT8 *ac_code, tag_checksum_data cs, BOOL inverse)
{
    UINT16 i = 0;
    UINT8 checksum = 0x00;

    if (cs.len < 3)
    {
        return IR_DECODE_SUCCEEDED;
    }

    for (i = cs.start_byte_pos; i < cs.end_byte_pos; i++)
    {
        checksum += (ac_code[i] >> 4) + (ac_code[i] & 0x0F);
    }

    checksum += cs.checksum_plus;

    if (TRUE == inverse)
    {
        checksum = ~checksum;
    }

    // apply checksum
    ac_code[cs.checksum_byte_pos] = checksum;

    IR_PRINTF("checksum value = %02X\n", checksum & 0x0F);
    IR_PRINTF("checksum byte pos = %d\n", cs.checksum_byte_pos);
    IR_PRINTF("\n");

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_checksum_spec_byte(UINT8 *ac_code, tag_checksum_data cs, BOOL inverse)
{
    UINT16 i = 0;
    UINT8 apply_byte_pos = 0;
    UINT8 checksum = 0x00;

#if 1
    if (cs.len < 4)
    {
        return IR_DECODE_SUCCEEDED;
    }
#endif

    for (i = 0; i < cs.len - 3; i++)
    {
        UINT8 pos = cs.spec_pos[i];
        UINT8 byte_pos = pos >> 1;

        if (0 == (pos & 0x01))
        {
            checksum += ac_code[byte_pos] >> 4;
        }
        else
        {
            checksum += ac_code[byte_pos] & 0x0F;
        }
    }

    checksum += cs.checksum_plus;

    if (TRUE == inverse)
    {
        checksum = ~checksum;
    }

    // apply checksum, for specific-half-byte checksum, the byte pos actually indicates the half-byte pos
    apply_byte_pos = cs.checksum_byte_pos >> 1;
    if (0 == (cs.checksum_byte_pos & 0x01))
    {
        // save low bits and add checksum as high bits
        ac_code[apply_byte_pos] = (ac_code[apply_byte_pos] & 0x0F) | (checksum << 4);
    }
    else
    {
        // save high bits and add checksum as low bits
        ac_code[apply_byte_pos] = (ac_code[apply_byte_pos] & 0xF0) | (checksum & 0x0F);
    }

    IR_PRINTF("checksum value = %02X\n", checksum & 0x0F);
    IR_PRINTF("checksum byte pos = %d\n", apply_byte_pos);

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_checksum_spec_byte_onebyte(UINT8 *ac_code, tag_checksum_data cs, BOOL inverse)
{
    UINT16 i = 0;
    UINT8 apply_byte_pos = 0;
    UINT8 checksum = 0x00;

#if 1
    if (cs.len < 4)
    {
        return IR_DECODE_SUCCEEDED;
    }
#endif

    for (i = 0; i < cs.len - 3; i++)
    {
        UINT8 pos = cs.spec_pos[i];
        UINT8 byte_pos = pos >> 1;

        if (0 == (pos & 0x01))
        {
            checksum += ac_code[byte_pos] >> 4;
        }
        else
        {
            checksum += ac_code[byte_pos] & 0x0F;
        }
    }

    checksum += cs.checksum_plus;

    if (TRUE == inverse)
    {
        checksum = ~checksum;
    }

    // apply checksum, for specific-half-byte checksum, the byte pos actually indicates the half-byte pos
    apply_byte_pos = cs.checksum_byte_pos >> 1;
    ac_code[apply_byte_pos] = checksum;

    IR_PRINTF("checksum value = %02X\n", checksum);
    IR_PRINTF("checksum byte pos = %d\n", apply_byte_pos);

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_checksum(struct ac_protocol *protocol)
{
    UINT8 i = 0;

    if (0 == protocol->checksum.len)
    {
        return IR_DECODE_SUCCEEDED;
    }

    // have some debug
    IR_PRINTF("\napply checksum :\n");
    IR_PRINTF("checksum num = %d\n", protocol->checksum.count);

    for(i = 0; i < protocol->checksum.count; i++)
    {
        // have some debug
        IR_PRINTF("num : %d\n", i + 1);
        IR_PRINTF("checksum type = %02X\n", protocol->checksum.checksum_data[i].type);

        switch (protocol->checksum.checksum_data[i].type)
        {
            case CHECKSUM_TYPE_BYTE:
                apply_checksum_byte(ir_hex_code, protocol->checksum.checksum_data[i], FALSE);
                break;
            case CHECKSUM_TYPE_BYTE_INVERSE:
                apply_checksum_byte(ir_hex_code, protocol->checksum.checksum_data[i], TRUE);
                break;
            case CHECKSUM_TYPE_HALF_BYTE:
                apply_checksum_halfbyte(ir_hex_code, protocol->checksum.checksum_data[i], FALSE);
                break;
            case CHECKSUM_TYPE_HALF_BYTE_INVERSE:
                apply_checksum_halfbyte(ir_hex_code, protocol->checksum.checksum_data[i], TRUE);
                break;
            case CHECKSUM_TYPE_SPEC_HALF_BYTE:
                apply_checksum_spec_byte(ir_hex_code, protocol->checksum.checksum_data[i], FALSE);
                break;
            case CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE:
                apply_checksum_spec_byte(ir_hex_code, protocol->checksum.checksum_data[i], TRUE);
                break;
            case CHECKSUM_TYPE_SPEC_HALF_BYTE_ONE_BYTE:
                apply_checksum_spec_byte_onebyte(ir_hex_code, protocol->checksum.checksum_data[i], FALSE);
                break;
            case CHECKSUM_TYPE_SPEC_HALF_BYTE_INVERSE_ONE_BYTE:
                apply_checksum_spec_byte_onebyte(ir_hex_code, protocol->checksum.checksum_data[i], TRUE);
                break;
            default:
                break;
        }
    }

    return IR_DECODE_SUCCEEDED;
}
