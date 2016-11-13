/**************************************************************************************************
Filename:       irda_lib.c
Revised:        Date: 2016-10-21
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode (compressed command type)

Revision log:
* 2016-10-21: created by strawmanbobi
**************************************************************************************************/

/**************************************************************************************************
 *                                            INCLUDES
 **************************************************************************************************/

#include <string.h>

#include "include/irda_defs.h"
#include "include/irda_decode.h"
#include "include/irda_tv_parse_protocol.h"

/**************************************************************************************************
 *                                            MACROS
 **************************************************************************************************/





/**************************************************************************************************
 *                                            CONSTANTS
 **************************************************************************************************/





/**************************************************************************************************
 *                                         LOCAL DATA TYPES
 **************************************************************************************************/
#pragma pack(1)
struct buffer
{
    UINT8 *data;
    UINT16 len;
    UINT16 offset;
} irda_file;
#pragma pack()




/**************************************************************************************************
 *                                         GLOBAL VARIABLES
 **************************************************************************************************/





/**************************************************************************************************
 *                                        EXTERNAL VARIABLES
 **************************************************************************************************/





/**************************************************************************************************
 *                                         LOCAL VARIABLES
 **************************************************************************************************/
static struct buffer *pbuffer = &irda_file;

//static UINT8 *prot_name = NULL;
static UINT8 *prot_cycles_num = NULL;
static irda_cycles_t *prot_cycles_data[IRDA_MAX];
static UINT8 prot_items_cnt = 0;
static irda_data_t *prot_items_data = NULL;
static irda_data_tv_t *remote_p;
static UINT8 *remote_pdata = NULL;

static UINT16 time_index = 0;
static UINT8 irda_level = IRDA_LEVEL_LOW;
static UINT8 irda_toggle_bit = FALSE;
static UINT8 irda_decode_flag = IRDA_DECODE_1_BIT;
static UINT8 cycles_num_size = 0;

/**************************************************************************************************
 *                                         LOCAL TABLES
 **************************************************************************************************/





/**************************************************************************************************
 *                                     LOCAL FUNCTION PROTOTYPES
 **************************************************************************************************/
static BOOL get_irda_protocol(UINT8 encode_type);
static BOOL get_irda_keymap(void);
static void print_irda_time(irda_data_t *data, UINT8 keyindex, UINT16 *irda_time);
static void process_decode_number(UINT8 keycode, irda_data_t *data, UINT8 valid_bits, UINT16 *irda_time);
static void convert_to_irda_time(UINT8 value, UINT16 *irda_time);
static void replace_with(irda_cycles_t *pcycles_num, UINT16 *irda_time);

/**************************************************************************************************
 *                                         GLOBAL FUNCTIONS
 **************************************************************************************************/
INT8 tv_lib_open(UINT8 *binary, UINT16 binary_length)
{
    // load binary to buffer
    pbuffer->data = binary;
    pbuffer->len = binary_length;
    pbuffer->offset = 0;
    return IR_DECODE_SUCCEEDED;
}

BOOL tv_lib_parse(UINT8 encode_type)
{
    if (FALSE == get_irda_protocol(encode_type))
    {
        return FALSE;
    }

    return get_irda_keymap();
}

UINT16 tv_lib_control(UINT8 key, UINT16 *user_data)
{
    UINT16 i = 0;

    time_index = 0;
    irda_level = IRDA_LEVEL_LOW;

    for (i = 0; i < prot_items_cnt; i++)
    {
        print_irda_time(&prot_items_data[i], key, user_data);
    }

    // next flip
    if (2 == prot_cycles_num[IRDA_FLIP])
    {
        irda_toggle_bit = (irda_toggle_bit == FALSE) ? TRUE : FALSE;
    }

    return time_index;
}

/**************************************************************************************************
 *                                         LOCAL FUNCTIONS
 **************************************************************************************************/
static BOOL get_irda_protocol(UINT8 encode_type)
{
    UINT8 i = 0;
    UINT8 name_size = 20;
    UINT8 *prot_cycles = NULL;
    UINT8 cycles_sum = 0;

    if (pbuffer->data == NULL)
    {
        return FALSE;
    }

    pbuffer->offset = 0;

    /* protocol name */
    // prot_name = pbuffer->data + pbuffer->offset;
    pbuffer->offset += name_size;

    /* cycles number */
    prot_cycles_num = pbuffer->data + pbuffer->offset;
    if (encode_type == 0)
    {
        cycles_num_size = 8;      /* "BOOT", "STOP", "SEP", "ONE", "ZERO", "FLIP", "TWO", "THREE" */
        if (prot_cycles_num[IRDA_TWO] == 0 && prot_cycles_num[IRDA_THREE] == 0)
        {
            irda_decode_flag = IRDA_DECODE_1_BIT;
        }
        else
        {
            irda_decode_flag = IRDA_DECODE_2_BITS;
        }
    }
    else if (encode_type == 1)
    {
        cycles_num_size = IRDA_MAX;
        irda_decode_flag = IRDA_DECODE_4_BITS;
    }
    else
    {
        return FALSE;
    }
    pbuffer->offset += cycles_num_size;

    /* cycles data */
    prot_cycles = pbuffer->data + pbuffer->offset;
    for (i = 0; i < cycles_num_size; i++)
    {
        if (0 != prot_cycles_num[i])
        {
            prot_cycles_data[i] = (irda_cycles_t *) (&prot_cycles[sizeof(irda_cycles_t) * cycles_sum]);
        }
        else
        {
            prot_cycles_data[i] = NULL;
        }
        cycles_sum += prot_cycles_num[i];
    }
    pbuffer->offset += sizeof(irda_cycles_t) * cycles_sum;

    /* items count */
    prot_items_cnt = pbuffer->data[pbuffer->offset];
    pbuffer->offset += sizeof(UINT8);

    /* items data */
    prot_items_data = (irda_data_t *) (pbuffer->data + pbuffer->offset);
    pbuffer->offset += prot_items_cnt * sizeof(irda_data_t);

    irda_toggle_bit = FALSE;

    return TRUE;
}

static BOOL get_irda_keymap(void)
{
    remote_p = (irda_data_tv_t *) (pbuffer->data + pbuffer->offset);
    pbuffer->offset += sizeof(irda_data_tv_t);

    if (strncmp(remote_p->magic, "irda", 4) == 0)
    {
        remote_pdata = pbuffer->data + pbuffer->offset;
        return TRUE;
    }

    return FALSE;
}

static void print_irda_time(irda_data_t *data, UINT8 keyindex, UINT16 *irda_time)
{
    UINT8 i = 0;
    UINT8 cycles_num = 0;
    irda_cycles_t *pcycles = NULL;
    UINT8 keycode = 0;

    if (NULL == data || NULL == irda_time)
    {
        return;
    }

    pcycles = prot_cycles_data[data->index];
    keycode = remote_pdata[remote_p->per_keycode_bytes * keyindex + data->index - 1];

    if (prot_cycles_num[IRDA_ONE] != 1 || prot_cycles_num[IRDA_ZERO] != 1)
    {
        return;
    }

    if (time_index >= USER_DATA_SIZE)
    {
        return;
    }

    if (data->bits == 1)
    {
        if (pcycles == NULL)
        {
            return;
        }

        cycles_num = prot_cycles_num[data->index];
        if (cycles_num > 5)
        {
            return;
        }

        for (i = cycles_num; i > 0; i--)
        {
            if (cycles_num == 2 && data->index == IRDA_FLIP)
            {
                if (irda_toggle_bit == TRUE)
                {
                    pcycles += 1;
                }
            }

            if (pcycles->mask && pcycles->space)
            {
                if (pcycles->flag == IRDA_FLAG_NORMAL)
                {
                    if (irda_level == IRDA_LEVEL_HIGH && time_index != 0)
                    {
                        time_index--;
                        irda_time[time_index++] += pcycles->mask;
                    }
                    else if (irda_level == IRDA_LEVEL_LOW)
                    {
                        irda_time[time_index++] = pcycles->mask;
                    }
                    irda_time[time_index++] = pcycles->space;
                    irda_level = IRDA_LEVEL_LOW;
                }
                else if (pcycles->flag == IRDA_FLAG_INVERSE)
                {
                    if (irda_level == IRDA_LEVEL_LOW && time_index != 0)
                    {
                        time_index--;
                        irda_time[time_index++] += pcycles->space;
                    }
                    else if (irda_level == IRDA_LEVEL_HIGH)
                    {
                        irda_time[time_index++] = pcycles->space;
                    }
                    irda_time[time_index++] = pcycles->mask;
                    irda_level = IRDA_LEVEL_HIGH;
                }
            }
            else if (0 == pcycles->mask && 0 != pcycles->space)
            {
                if (irda_level == IRDA_LEVEL_LOW && time_index != 0)
                {
                    time_index--;
                    irda_time[time_index++] += pcycles->space;
                }
                else if (irda_level == IRDA_LEVEL_HIGH)
                {
                    irda_time[time_index++] = pcycles->space;
                }
                irda_level = IRDA_LEVEL_LOW;
            }
            else if (0 == pcycles->space && 0 != pcycles->mask)
            {
                if (irda_level == IRDA_LEVEL_HIGH && time_index != 0)
                {
                    time_index--;
                    irda_time[time_index++] += pcycles->mask;
                }
                else if (irda_level == IRDA_LEVEL_LOW)
                {
                    irda_time[time_index++] = pcycles->mask;
                }
                irda_level = IRDA_LEVEL_HIGH;
            }
            else
            {
                // do nothing
            }

            if (cycles_num == 2 && data->index == IRDA_FLIP)
            {
                break;
            }
            else
            {
                pcycles++;
            }
        }
    }
    else
    {
        // mode: inverse
        if (data->mode == 1)
            keycode = ~keycode;

        if (irda_decode_flag == IRDA_DECODE_1_BIT)
        {
            // for binary formatted code
            process_decode_number(keycode, data, 1, irda_time);
        }
        else if (irda_decode_flag == IRDA_DECODE_2_BITS)
        {
            // for quanternary formatted code
            process_decode_number(keycode, data, 2, irda_time);
        }
        else if (irda_decode_flag == IRDA_DECODE_4_BITS)
        {
            // for hexadecimal formatted code
            process_decode_number(keycode, data, 4, irda_time);
        }
    }
}

static void process_decode_number(UINT8 keycode, irda_data_t *data, UINT8 valid_bits, UINT16 *irda_time)
{
    UINT8 i = 0;
    UINT8 value = 0;
    UINT8 bit_num = data->bits / valid_bits;
    UINT8 valid_value = 0;

    valid_value = (valid_bits == 1) ? 1 : (valid_bits * valid_bits - 1);

    if (data->lsb == IRDA_LSB)
    {
        for (i = 0; i < bit_num; i++)
        {
            value = (keycode >> (valid_bits * i)) & valid_value;
            convert_to_irda_time(value, irda_time);
        }
    }
    else if (data->lsb == IRDA_MSB)
    {
        for (i = 0; i < bit_num; i++)
        {
            value = (keycode >> (data->bits - valid_bits * (i + 1))) & valid_value;
            convert_to_irda_time(value, irda_time);
        }
    }
}

static void convert_to_irda_time(UINT8 value, UINT16 *irda_time)
{
    switch (value)
    {
        case 0:
            replace_with(prot_cycles_data[IRDA_ZERO], irda_time);
            break;
        case 1:
            replace_with(prot_cycles_data[IRDA_ONE], irda_time);
            break;
        case 2:
            replace_with(prot_cycles_data[IRDA_TWO], irda_time);
            break;
        case 3:
            replace_with(prot_cycles_data[IRDA_THREE], irda_time);
            break;
        case 4:
            replace_with(prot_cycles_data[IRDA_FOUR], irda_time);
            break;
        case 5:
            replace_with(prot_cycles_data[IRDA_FIVE], irda_time);
            break;
        case 6:
            replace_with(prot_cycles_data[IRDA_SIX], irda_time);
            break;
        case 7:
            replace_with(prot_cycles_data[IRDA_SEVEN], irda_time);
            break;
        case 8:
            replace_with(prot_cycles_data[IRDA_EIGHT], irda_time);
            break;
        case 9:
            replace_with(prot_cycles_data[IRDA_NINE], irda_time);
            break;
        case 0x0A:
            replace_with(prot_cycles_data[IRDA_A], irda_time);
            break;
        case 0x0B:
            replace_with(prot_cycles_data[IRDA_B], irda_time);
            break;
        case 0x0C:
            replace_with(prot_cycles_data[IRDA_C], irda_time);
            break;
        case 0x0D:
            replace_with(prot_cycles_data[IRDA_D], irda_time);
            break;
        case 0x0E:
            replace_with(prot_cycles_data[IRDA_E], irda_time);
            break;
        case 0x0F:
            replace_with(prot_cycles_data[IRDA_F], irda_time);
            break;
        default:
            break;
    }
}

static void replace_with(irda_cycles_t *pcycles_num, UINT16 *irda_time)
{
    if (NULL == pcycles_num || NULL == irda_time)
    {
        return;
    }

    if (pcycles_num->flag == IRDA_FLAG_NORMAL)
    {
        if (irda_level == IRDA_LEVEL_HIGH && time_index != 0)
        {
            time_index--;
            irda_time[time_index++] += pcycles_num->mask;
        }
        else if (irda_level == IRDA_LEVEL_LOW)
        {
            irda_time[time_index++] = pcycles_num->mask;
        }
        irda_time[time_index++] = pcycles_num->space;
        irda_level = IRDA_LEVEL_LOW;
    }
    else if (pcycles_num->flag == IRDA_FLAG_INVERSE)
    {
        if (irda_level == IRDA_LEVEL_LOW && time_index != 0)
        {
            time_index--;
            irda_time[time_index++] += pcycles_num->space;
        }
        else if (irda_level == IRDA_LEVEL_HIGH)
        {
            irda_time[time_index++] = pcycles_num->space;
        }
        irda_time[time_index++] = pcycles_num->mask;
        irda_level = IRDA_LEVEL_HIGH;
    }
}