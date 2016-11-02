/**************************************************************************************************
Filename:       ucon_decode.c
Revised:        Date: 2015-08-01
Revision:       Revision: 1.0

Description:    This file provides algorithms for UCON IR decode (status type)

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2015-08-01: created by strawmanbobi
**************************************************************************************************/
#include <stdio.h>
#include <stdlib.h>

#if (defined BOARD_PC) || (defined BOARD_MT6580)
#include <sys/types.h>
#include <unistd.h>
#include <errno.h>
#endif

#include <string.h>

#include "ucon_decode.h"
#include "irda_utils.h"
#include "irda_parse_frame_parameter.h"
#include "irda_parse_ac_parameter.h"
#include "irda_parse_forbidden_info.h"
#include "irda_irframe.h"
#include "irda_apply.h"
#include "irda_lib.h"
#include "bc_parse_parameter.h"

#if defined BOARD_CC254X
#include "ucon_data.h"
#include "ucon_remote.h"
#include "ucon_public.h"
#include "ucon_irda.h"
#include "npi.h"
#endif

#if defined BOARD_MC200
#include "yk_irda.h"
#endif

struct ir_bin_buffer binaryfile;
struct ir_bin_buffer *pirda_buffer = &binaryfile;
struct tag_head *tags;

// IRDA hex code
UINT8* ir_hex_code = NULL;
UINT8 ir_hex_len = 0;

// global output buffer
UINT8 tag_count = 0;
UINT16 tag_head_offset = 0;

UINT16 global_mem_consume = 0;

#if (defined BOARD_PC) || (defined BOARD_MT6580)
UINT8 byteArray[PROTOCOL_SIZE] = {0};
UINT16 user_data[USER_DATA_SIZE] = {0};
UINT8 tv_bin[EXPECTED_MEM_SIZE] = {0};
UINT16 tv_bin_length = 0;
remote_ac_status_t ac_status;
#endif

// 2015-09-06 protocol version minor change: parse TAG 1009 instead of TAG 304
const UINT16 tag_index[TAG_COUNT_FOR_PROTOCOL] =
{
    300, 301, 302, 303, 305, 306, 307, 1001, 1002,
    1003, 1004, 1005, 1007, 1008, 1009, 1010, 1011,
    1012, 1013, 1015, 1016, 1501, 1502, 1503, 1504, 1505,
    1506, 1508, 1509
};

const UINT16 bc_tag_index[TAG_COUNT_FOR_BC_PROTOCOL] =
{
    100, 101, 102, 103, 200, 201, 202, 203, 204, 205,
    206, 207, 208, 209, 210, 211, 212, 213, 214, 300
};

// 2015-09-09 updated by strawmanbobi, change global data context to array pointer
protocol *context = (protocol *) byteArray;

// BLE decode structure, share with a same byteArray to save memory
t_bc_protocol *context_bc = (t_bc_protocol *) byteArray;

// ban function table
// fixed swing should not be counted in case of UCON
INT8 apply_power(remote_ac_status_t ac_status, UINT8 function_code);
INT8 apply_mode(remote_ac_status_t ac_status, UINT8 function_code);
INT8 apply_wind_speed(remote_ac_status_t ac_status, UINT8 function_code);
INT8 apply_swing(remote_ac_status_t ac_status, UINT8 function_code);
INT8 apply_temperature(remote_ac_status_t ac_status, UINT8 function_code);

lp_apply_ac_parameter apply_table[AC_APPLY_MAX] =
{
    apply_power,
    apply_mode,
    apply_temperature,
    apply_temperature,
    apply_wind_speed,
    apply_swing,
    apply_swing
};

///////////////////////////////////////////////// Air Conditioner Begin /////////////////////////////////////////////////

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 binary_open(const char *file)
{
    FILE *stream = fopen(file, "rb");
    if (stream == NULL)
    {
        IR_PRINTF("\nfile open failed : %d\n", errno);
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_END);
    pirda_buffer->len = ftell(stream);

    fseek(stream, 0, SEEK_SET);
    fread(pirda_buffer->data, pirda_buffer->len, 1, stream);
    fclose(stream);

    return IR_DECODE_SUCCEEDED;
}
#endif

INT8 binary_parse_offset()
{
    int i = 0;
    UINT16 *phead = (UINT16 *) &pirda_buffer->data[1];

    tag_count = pirda_buffer->data[0];
    if(TAG_COUNT_FOR_PROTOCOL != tag_count)
    {
        return IR_DECODE_FAILED;
    }

    tag_head_offset = (tag_count << 1) + 1;

    tags = (t_tag_head *) irda_malloc(tag_count * sizeof(t_tag_head));
    if (NULL == tags)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < tag_count; i++)
    {
        tags[i].tag = tag_index[i];
        tags[i].offset = *(phead + i);
        if (tags[i].offset == TAG_INVALID)
        {
            tags[i].len = 0;
        }
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 binary_parse_len()
{
    UINT16 i = 0, j = 0;
    for (i = 0; i < (tag_count - 1); i++)
    {
        if (tags[i].offset == TAG_INVALID)
        {
            continue;
        }

        for (j = (i + 1); j < tag_count; j++)
        {
            if (tags[j].offset != TAG_INVALID)
            {
                break;
            }
        }
        if (j < tag_count)
        {
            tags[i].len = tags[j].offset - tags[i].offset;
        }
        else
        {
            tags[i].len = pirda_buffer->len - tags[i].offset - tag_head_offset;
            return IR_DECODE_SUCCEEDED;
        }
    }
    if (tags[tag_count - 1].offset != TAG_INVALID)
    {
        tags[tag_count - 1].len = pirda_buffer->len - tag_head_offset - tags[tag_count - 1].offset;
    }

    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)
void binary_tags_info()
{
    UINT16 i = 0;
    for (i = 0; i < tag_count; i++)
    {
        if (tags[i].len == 0)
        {
            continue;
        }
        IR_PRINTF("tag(%d).len = %d\n", tags[i].tag, tags[i].len);
    }
}
#endif

INT8 binary_parse_data()
{
    UINT16 i = 0;
    for (i = 0; i < tag_count; i++)
    {
        tags[i].pdata = pirda_buffer->data + tags[i].offset + tag_head_offset;
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 free_ac_context()
{
    UINT16 i = 0;

    if (ir_hex_code != NULL)
    {
        irda_free(ir_hex_code);
        ir_hex_code = NULL;
    }
    ir_hex_len = 0;

    if (context->default_code.data != NULL)
    {
        irda_free(context->default_code.data);
        context->default_code.data = NULL;
        context->default_code.len = 0;
    }

    for (i = 0; i < AC_POWER_MAX; i++)
    {
        if (context->power1.comp_data[i].segment != NULL)
        {
            irda_free(context->power1.comp_data[i].segment);
            context->power1.comp_data[i].segment = NULL;
            context->power1.comp_data[i].seg_len = 0;
        }
    }

    for (i = 0; i < AC_TEMP_MAX; i++)
    {
        if (context->temp1.comp_data[i].segment != NULL)
        {
            irda_free(context->temp1.comp_data[i].segment);
            context->temp1.comp_data[i].segment = NULL;
            context->temp1.comp_data[i].seg_len = 0;
        }
        if (context->temp2.comp_data[i].segment != NULL)
        {
            irda_free(context->temp2.comp_data[i].segment);
            context->temp2.comp_data[i].segment = NULL;
            context->temp2.comp_data[i].seg_len = 0;
        }
    }

    for (i = 0; i < AC_MODE_MAX; i++)
    {
        if (context->mode1.comp_data[i].segment != NULL)
        {
            irda_free(context->mode1.comp_data[i].segment);
            context->mode1.comp_data[i].segment = NULL;
            context->mode1.comp_data[i].seg_len = 0;
        }
        if (context->mode2.comp_data[i].segment != NULL)
        {
            irda_free(context->mode2.comp_data[i].segment);
            context->mode2.comp_data[i].segment = NULL;
            context->mode2.comp_data[i].seg_len = 0;
        }
    }
    for (i = 0; i < AC_WS_MAX; i++)
    {
        if (context->speed1.comp_data[i].segment != NULL)
        {
            irda_free(context->speed1.comp_data[i].segment);
            context->speed1.comp_data[i].segment = NULL;
            context->speed1.comp_data[i].seg_len = 0;
        }
        if (context->speed2.comp_data[i].segment != NULL)
        {
            irda_free(context->speed2.comp_data[i].segment);
            context->speed2.comp_data[i].segment = NULL;
            context->speed2.comp_data[i].seg_len = 0;
        }
    }

    for (i = 0; i < context->si.mode_count; i++)
    {
        if (context->swing1.comp_data != NULL &&
                context->swing1.comp_data[i].segment != NULL)
        {
            irda_free(context->swing1.comp_data[i].segment);
            context->swing1.comp_data[i].segment = NULL;
            context->swing1.comp_data[i].seg_len = 0;
        }
        if (context->swing2.comp_data != NULL &&
                context->swing2.comp_data[i].segment != NULL)
        {
            irda_free(context->swing2.comp_data[i].segment);
            context->swing2.comp_data[i].segment = NULL;
            context->swing2.comp_data[i].seg_len = 0;
        }
    }

    for (i = 0; i < AC_FUNCTION_MAX - 1; i++)
    {
        if (context->function1.comp_data[i].segment != NULL)
        {
            irda_free(context->function1.comp_data[i].segment);
            context->function1.comp_data[i].segment = NULL;
            context->function1.comp_data[i].seg_len = 0;
        }
        if (context->function2.comp_data[i].segment != NULL)
        {
            irda_free(context->function2.comp_data[i].segment);
            context->function2.comp_data[i].segment = NULL;
            context->function2.comp_data[i].seg_len = 0;
        }
    }

    // free composite data for swing1 and swing 2
    if(context->swing1.comp_data != NULL)
    {
        irda_free(context->swing1.comp_data);
        context->swing1.comp_data = NULL;
    }
    if(context->swing2.comp_data != NULL)
    {
        irda_free(context->swing2.comp_data);
        context->swing2.comp_data = NULL;
    }

    /* modified by xiangjiang 2015-11-20 - begin - */
#if 0
    if(context->checksum.spec_pos != NULL)
    {
        irda_free(context->checksum.spec_pos);
        context->checksum.spec_pos = NULL;
    }
#else
    for(i = 0; i < context->checksum.count; i++)
    {
        if(context->checksum.checksum_data != NULL &&
           context->checksum.checksum_data[i].spec_pos != NULL)
        {
            irda_free(context->checksum.checksum_data[i].spec_pos);
            context->checksum.checksum_data[i].len = 0;
            context->checksum.checksum_data[i].spec_pos = NULL;
        }
    }
    if(context->checksum.checksum_data != NULL)
    {
        irda_free(context->checksum.checksum_data);
        context->checksum.checksum_data = NULL;
    }
#endif
    /* modified by xiangjiang 2015-11-20 - end - */

    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 irda_ac_lib_open(const char *file_name)
{
    IR_PRINTF("\nirda_ac_lib_open: %s\n", file_name);
    return binary_open(file_name);
}
#else
INT8 irda_ac_lib_open(UINT8 *binary_file, UINT16 binary_length)
{
    // load bin to buffer
    pirda_buffer->data = binary_file;
    pirda_buffer->len = binary_length;
    pirda_buffer->offset = 0;
    return IR_DECODE_SUCCEEDED;
}
#endif

INT8 irda_context_init()
{
    irda_memset(context, 0, sizeof(protocol));
    return IR_DECODE_SUCCEEDED;
}

INT8 irda_ac_lib_parse()
{
    UINT16 i = 0;
    // suggest not to  call init function here for de-couple purpose
#if defined BOARD_CC254X
    irda_context_init();
#endif
    if (IR_DECODE_FAILED == binary_parse_offset())
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == binary_parse_len())
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == binary_parse_data())
    {
        return IR_DECODE_FAILED;
    }

#if (defined BOARD_PC) || (defined BOARD_MT6580)
    binary_tags_info();
#endif
    context->endian = 0;
    context->lastbit = 0;
    context->repeat_times = 1;

    for (i = 0; i < N_MODE_MAX; i++)
    {
        context->n_mode[i].enable = TRUE;
        context->n_mode[i].allspeed = FALSE;
        context->n_mode[i].alltemp = FALSE;
        irda_memset(context->n_mode[i].speed, 0x00, AC_WS_MAX);
        context->n_mode[i].speed_cnt = 0;
        irda_memset(context->n_mode[i].temp, 0x00, AC_TEMP_MAX);
        context->n_mode[i].temp_cnt = 0;
    }

    // parse tag 1506 in first priority
    for (i = 0; i < tag_count; i++)
    {
        if (tags[i].tag == TAG_AC_SWING_INFO)
        {
            if (tags[i].len != 0)
            {
                parse_swing_info_1506(&tags[i], &(context->si));
            }
            else
            {
                context->si.type = SWING_TYPE_NORMAL;
                context->si.mode_count = 2;
            }
            context->si.dir_index = 0;
        }
    }

    for (i = 0; i < tag_count; i++)
    {
        if (tags[i].len == 0)
        {
            continue;
        }
        // then parse TAG 1007 or 1015
        if (context->si.type == SWING_TYPE_NORMAL)
        {
            UINT16 swing_space_size = 0;
            if (tags[i].tag == TAG_AC_SWING_1)
            {
                IR_PRINTF("\nparse swing 1\n");
                context->swing1.count = context->si.mode_count;
                context->swing1.len = tags[i].len >> 1;
                swing_space_size = sizeof(tag_comp) * context->si.mode_count;
                context->swing1.comp_data = (tag_comp*) irda_malloc(swing_space_size);
                if (NULL == context->swing1.comp_data)
                {
                    return IR_DECODE_FAILED;
                }

                irda_memset(context->swing1.comp_data, 0x00, swing_space_size);
                if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i],
                                                                  context->swing1.comp_data,
                                                                  context->si.mode_count,
                                                                  AC_PARAMETER_TYPE_1))
                {
                    return IR_DECODE_FAILED;
                }
            }
            else if (tags[i].tag == TAG_AC_SWING_2)
            {
                IR_PRINTF("\nparse swing 2\n");
                context->swing2.count = context->si.mode_count;
                context->swing2.len = tags[i].len >> 1;
                swing_space_size = sizeof(tag_comp) * context->si.mode_count;
                context->swing2.comp_data = (tag_comp*) irda_malloc(swing_space_size);
                if (NULL == context->swing2.comp_data)
                {
                    return IR_DECODE_FAILED;
                }
                irda_memset(context->swing2.comp_data, 0x00, swing_space_size);
                if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i],
                                                                  context->swing2.comp_data,
                                                                  context->si.mode_count,
                                                                  AC_PARAMETER_TYPE_2))
                {
                    return IR_DECODE_FAILED;
                }
            }
        }

        if (tags[i].tag == TAG_AC_DEFAULT_CODE) // default code TAG
        {
            IR_PRINTF("\nparse default\n");
            context->default_code.data = (UINT8 *) irda_malloc((tags[i].len - 2) >> 1);
            if (NULL == context->default_code.data)
            {
                return IR_DECODE_FAILED;
            }
            if (IR_DECODE_FAILED == parse_defaultcode_1002(&tags[i], &(context->default_code)))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_POWER_1) // power tag
        {
            IR_PRINTF("\nparse power 1\n");
            context->power1.len = tags[i].len >> 1;
            if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i],
                                                              context->power1.comp_data,
                                                              AC_POWER_MAX,
                                                              AC_PARAMETER_TYPE_1))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_TEMP_1) // temperature tag type 1
        {
            IR_PRINTF("\nparse temperature 1\n");
            if (IR_DECODE_FAILED == parse_temp_1_1003(&tags[i], &(context->temp1)))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_MODE_1) // mode tag
        {
            IR_PRINTF("\nparse mode 1\n");
            context->mode1.len = tags[i].len >> 1;
            if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i],
                                                              context->mode1.comp_data,
                                                              AC_MODE_MAX,
                                                              AC_PARAMETER_TYPE_1))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_SPEED_1) // wind speed tag
        {
            IR_PRINTF("\nparse speed 1\n");
            context->speed1.len = tags[i].len >> 1;
            if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i],
                                                              context->speed1.comp_data,
                                                              AC_WS_MAX,
                                                              AC_PARAMETER_TYPE_1))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_CHECKSUM_TYPE)
        {
            IR_PRINTF("\nparse checksum\n");
            if (IR_DECODE_FAILED == parse_checksum_1008(&tags[i], &(context->checksum)))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_MODE_2)
        {
            IR_PRINTF("\nparse mode 2\n");
            context->mode2.len = tags[i].len >> 1;
            if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i], context->mode2.comp_data, AC_MODE_MAX, AC_PARAMETER_TYPE_1))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_SPEED_2)
        {
            IR_PRINTF("\nparse speed 2\n");
            context->speed2.len = tags[i].len >> 1;
            if (IR_DECODE_FAILED == parse_common_ac_parameter(&tags[i], context->speed2.comp_data, AC_WS_MAX, AC_PARAMETER_TYPE_1))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_TEMP_2)
        {
            IR_PRINTF("\nparse temperature 2\n");
            if (IR_DECODE_FAILED == parse_temp_2_1011(&tags[i], &(context->temp2)))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_SOLO_FUNCTION)
        {
            IR_PRINTF("\nparse solo functions\n");
            if (IR_DECODE_FAILED == parse_solo_code_1009(&tags[i], &(context->sc)))
            {
                return IR_DECODE_FAILED;
            }
            context->solo_function_mark = 1;
        }
        else if (tags[i].tag == TAG_AC_FUNCTION_1)
        {
            if (IR_DECODE_FAILED == parse_function_1_1010(&tags[i], &(context->function1)))
            {
                IR_PRINTF("\nfunction code parse error\n");
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_FUNCTION_2)
        {
            IR_PRINTF("\nparse function 2\n");
            if (IR_DECODE_FAILED == parse_function_2_1016(&tags[i], &(context->function2)))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_FRAME_LENGTH)
        {
            if (IR_DECODE_FAILED == parse_framelen_304(&tags[i], tags[i].len))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_ZERO)
        {
            if (IR_DECODE_FAILED == parse_zero_301(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_ONE)
        {
            if (IR_DECODE_FAILED == parse_one_302(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BOOT_CODE)
        {
            if (IR_DECODE_FAILED == parse_bootcode_300(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_REPEAT_TIMES)
        {
            if (IR_DECODE_FAILED == parse_repeat_times_1508(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BITNUM)
        {
            if (IR_DECODE_FAILED == parse_bitnum_1509(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_ENDIAN)
        {
            if (IR_DECODE_FAILED == parse_endian_306(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BAN_FUNCTION_IN_COOL_MODE)
        {
            if (IR_DECODE_FAILED == parse_nmode_150x(&tags[i], N_COOL))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BAN_FUNCTION_IN_HEAT_MODE)
        {
            if (IR_DECODE_FAILED == parse_nmode_150x(&tags[i], N_HEAT))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BAN_FUNCTION_IN_AUTO_MODE)
        {
            if (IR_DECODE_FAILED == parse_nmode_150x(&tags[i], N_AUTO))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BAN_FUNCTION_IN_FAN_MODE)
        {
            if (IR_DECODE_FAILED == parse_nmode_150x(&tags[i], N_FAN))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_AC_BAN_FUNCTION_IN_DRY_MODE)
        {
            if (IR_DECODE_FAILED == parse_nmode_150x(&tags[i], N_DRY))
            {
                return IR_DECODE_FAILED;
            }
        }
    }

    for(i = 0 ; i < tag_count; i++)
    {
        if(tags[i].len == 0)
        {
            continue;
        }
        if (tags[i].tag == TAG_AC_DELAY_CODE)
        {
            if (IR_DECODE_FAILED == parse_delaycode_303(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
        if (tags[i].tag == TAG_AC_LASTBIT)
        {
            if (IR_DECODE_FAILED == parse_lastbit_307(&tags[i]))
            {
                return IR_DECODE_FAILED;
            }
        }
    }

    if(NULL != tags)
    {
        irda_free(tags);
        tags = NULL;
    }

    ir_hex_code = (UINT8 *) irda_malloc(context->default_code.len);
    if(NULL == ir_hex_code)
    {
        // warning: this AC bin contains no default code
        return IR_DECODE_FAILED;
    }

    ir_hex_len = context->default_code.len;
    irda_memset(ir_hex_code, 0x00, ir_hex_len);

    // pre-calculate solo function status after parse phase
    if (1 == context->solo_function_mark)
    {
        context->solo_function_mark = 0x00;
        // bit order from right to left : power, mode, temp+, temp-, wind_speed, swing, fix
        for (i = AC_FUNCTION_POWER; i < AC_FUNCTION_MAX; i++)
        {
            if (isin(context->sc.solo_function_codes, i, context->sc.solo_func_count))
            {
                context->solo_function_mark |= (1 << (i - 1));
            }
        }
    }

    return IR_DECODE_SUCCEEDED;
}

BOOL is_solo_function(UINT8 function_code)
{
    return (((context->solo_function_mark >> (function_code - 1)) & 0x01) == 0x01) ? TRUE : FALSE;
}

UINT8 has_function(struct ac_protocol *protocol, UINT8 function)
{
    if (0 != protocol->function1.len)
    {
        if(0 != protocol->function1.comp_data[function - 1].seg_len)
        {
            return TRUE;
        }
    }

    if(0 != protocol->function2.len)
    {
        if(0 != protocol->function2.comp_data[function - 1].seg_len)
        {
            return TRUE;
        }
    }

    return FALSE;
}

INT8 apply_power(remote_ac_status_t ac_status, UINT8 function_code)
{
    apply_ac_power(context, ac_status.acPower);
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_mode(remote_ac_status_t ac_status, UINT8 function_code)
{
    if (IR_DECODE_FAILED == apply_ac_mode(context, ac_status.acMode))
    {
        // do not implement this mechanism since mode, temperature, wind
        // speed would have unspecified function
        //if(FALSE == has_function(context, AC_FUNCTION_MODE))
        {
            return IR_DECODE_FAILED;
        }
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 apply_wind_speed(remote_ac_status_t ac_status, UINT8 function_code)
{
    if (FALSE == context->n_mode[ac_status.acMode].allspeed)
    {
        // if this level is not in black list
        if(!isin(context->n_mode[ac_status.acMode].speed,
                 ac_status.acWindSpeed,
                 context->n_mode[ac_status.acMode].speed_cnt))
        {
            if(IR_DECODE_FAILED == apply_ac_wind_speed(context, ac_status.acWindSpeed) &&
               function_code == AC_FUNCTION_WIND_SPEED)
            {
                // do not implement this mechanism since mode, temperature, wind
                // speed would have unspecified function
                //if(FALSE == has_function(context, AC_FUNCTION_WIND_SPEED))
                {
                    return IR_DECODE_FAILED;
                }
            }
        }
        else
        {
            // if this level is in black list, do not send IR wave if user want to apply this function
            if(function_code == AC_FUNCTION_WIND_SPEED)
            {
                // do not implement this mechanism since mode, temperature, wind
                // speed would have unspecified function
                //if(FALSE == has_function(context, AC_FUNCTION_WIND_SPEED))
                {
                    return IR_DECODE_FAILED;
                }
            }
        }
    }
    else
    {
        // if this level is in black list, do not send IR wave if user want to apply this function
        if(function_code == AC_FUNCTION_WIND_SPEED)
        {
            // do not implement this mechanism since mode, temperature, wind
            // speed would have unspecified function
            //if(FALSE == has_function(context, AC_FUNCTION_WIND_SPEED))
            {
                return IR_DECODE_FAILED;
            }
        }
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_swing(remote_ac_status_t ac_status, UINT8 function_code)
{
    if(function_code == AC_FUNCTION_WIND_FIX)
    {
        // adjust fixed wind direction according to current status
        if(context->si.type == SWING_TYPE_NORMAL && context->si.mode_count > 1)
        {
            if (TRUE == context->change_wind_direction)
            {
                context->si.dir_index++;
            }

            if(context->si.dir_index == context->si.mode_count)
            {
                // reset dir index
                context->si.dir_index = 1;
            }
            context->swing_status = context->si.dir_index;
        }
    }
    else if(function_code == AC_FUNCTION_WIND_SWING)
    {
        context->swing_status = 0;
    }
    else
    {
        // do nothing
    }

    if(IR_DECODE_FAILED == apply_ac_swing(context, context->swing_status))
    {
        if(function_code == AC_FUNCTION_WIND_SWING && FALSE == has_function(context, AC_FUNCTION_WIND_SWING))
        {
            return IR_DECODE_FAILED;
        }
        else if(function_code == AC_FUNCTION_WIND_FIX && FALSE == has_function(context, AC_FUNCTION_WIND_FIX))
        {
            return IR_DECODE_FAILED;
        }
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 apply_temperature(remote_ac_status_t ac_status, UINT8 function_code)
{
    if (FALSE == context->n_mode[ac_status.acMode].alltemp)
    {
        if(!isin(context->n_mode[ac_status.acMode].temp,
                 ac_status.acTemp,
                 context->n_mode[ac_status.acMode].temp_cnt))
        {
            if(IR_DECODE_FAILED == apply_ac_temperature(context, ac_status.acTemp))
            {
                if(function_code == AC_FUNCTION_TEMPERATURE_UP /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_UP)*/)
                {
                    return IR_DECODE_FAILED;
                }
                else if(function_code == AC_FUNCTION_TEMPERATURE_DOWN /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_DOWN)*/)
                {
                    return IR_DECODE_FAILED;
                }
            }
        }
        else
        {
            // if this level is in black list, do not send IR wave if user want to apply this function
            if(function_code == AC_FUNCTION_TEMPERATURE_UP /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_UP)*/)
            {
                return IR_DECODE_FAILED;
            }
            else if(function_code == AC_FUNCTION_TEMPERATURE_DOWN /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_DOWN)*/)
            {
                return IR_DECODE_FAILED;
            }
        }
    }
    else
    {
        // if this level is in black list, do not send IR wave if user want to apply this function
        if(function_code == AC_FUNCTION_TEMPERATURE_UP /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_UP)*/)
        {
            return IR_DECODE_FAILED;
        }
        else if(function_code == AC_FUNCTION_TEMPERATURE_DOWN /*&& FALSE == has_function(context, AC_FUNCTION_TEMPERATURE_DOWN)*/)
        {
            return IR_DECODE_FAILED;
        }
    }
    return IR_DECODE_SUCCEEDED;
}

UINT16 irda_ac_lib_control(remote_ac_status_t ac_status, UINT16 *user_data, UINT8 function_code,
                           UINT8 change_wind_direction)
{
    UINT16 time_length = 0;
#if (defined BOARD_PC)|| (defined BOARD_MT6580)
    UINT8 i = 0;
#endif

#if 0
    // prepare ac status to parameter array
    UINT8 parameter_array[AC_APPLY_MAX] =
    {
        ac_status.acPower,
        ac_status.acMode,
        ac_status.acWindSpeed,
        ac_status.acWindDir,
        ac_status.acTemp,
        function_code
    };
#endif

    if (0 == context->default_code.len)
    {
        IR_PRINTF("\ndefault code is empty\n");
        return 0;
    }

    // pre-set change wind direction flag here
    context->change_wind_direction = change_wind_direction;

    context->time = user_data;

    // generate temp buffer for frame calculation
    irda_memcpy(ir_hex_code, context->default_code.data, context->default_code.len);

#if defined USE_APPLY_TABLE
    if(ac_status.acPower != AC_POWER_OFF)
    {
        for (i = AC_APPLY_POWER; i < AC_APPLY_MAX; i++)
        {
            apply_table[i](context, parameter_array[i]);
        }
    }
#else
    if(ac_status.acPower == AC_POWER_OFF)
    {
        // otherwise, power should always be applied
        apply_power(ac_status, function_code);
    }
    else
    {
        // check the mode as the first priority, despite any other status
        if(TRUE == context->n_mode[ac_status.acMode].enable)
        {
            if (is_solo_function(function_code))
            {
                // this key press function needs to send solo code
                apply_table[function_code - 1](ac_status, function_code);
            }
            else
            {
                if(!is_solo_function(AC_FUNCTION_POWER))
                {
                    apply_power(ac_status, function_code);
                }

                if(!is_solo_function(AC_FUNCTION_MODE))
                {
                    if (IR_DECODE_FAILED == apply_mode(ac_status, function_code))
                    {
                        return 0;
                    }
                }

                if(!is_solo_function(AC_FUNCTION_WIND_SPEED))
                {
                    if (IR_DECODE_FAILED == apply_wind_speed(ac_status, function_code))
                    {
                        return 0;
                    }
                }

                if(!is_solo_function(AC_FUNCTION_WIND_SWING) &&
                   !is_solo_function(AC_FUNCTION_WIND_FIX))
                {
                    if (IR_DECODE_FAILED == apply_swing(ac_status, function_code))
                    {
                        return 0;
                    }
                }

                if(!is_solo_function(AC_FUNCTION_TEMPERATURE_UP) &&
                   !is_solo_function(AC_FUNCTION_TEMPERATURE_DOWN))
                {
                    if (IR_DECODE_FAILED == apply_temperature(ac_status, function_code))
                    {
                        return 0;
                    }
                }
            }
        }
        else
        {
            return 0;
        }
    }
#endif
    apply_ac_function(context, function_code);
    // checksum should always be applied
    apply_checksum(context);

    // have some debug
#if (defined BOARD_PC)|| (defined BOARD_MT6580)
    IR_PRINTF("==============================\n");
    for(i = 0; i < ir_hex_len; i++)
    {
        IR_PRINTF("[%02X] ", ir_hex_code[i]);
    }
    IR_PRINTF("\n");
#endif
#if (defined BOARD_CC254X) && (PRINT_IRDA_DATA == TRUE)
    NPI_PrintString("hex:\r\n");

    for (UINT16 i = 0; i < context->default_code.len; i++)
    {
        NPI_PrintValue("", ir_hex_code[i], 16);
    }
    NPI_PrintString("\r\n");
#endif

    time_length = create_ir_frame();

    return time_length;
}

void irda_ac_lib_close()
{
    // free context
    if (NULL != tags)
    {
        irda_free(tags);
        tags = NULL;
    }
    free_ac_context();
    return;
}

// utils
INT8 get_temperature_range(UINT8 ac_mode, INT8* temp_min, INT8* temp_max)
{
    UINT8 i = 0;

    if (ac_mode >= AC_MODE_MAX)
    {
        return IR_DECODE_FAILED;
    }
    if (NULL == temp_min || NULL == temp_max)
    {
        return IR_DECODE_FAILED;
    }

    if (1 == context->n_mode[ac_mode].alltemp)
    {
        *temp_min = *temp_max = -1;
        return IR_DECODE_SUCCEEDED;
    }

    *temp_min = -1;
    *temp_max = -1;
    for (i = 0; i < AC_TEMP_MAX; i++)
    {
        if(isin(context->n_mode[ac_mode].temp, i, context->n_mode[ac_mode].temp_cnt) ||
                (context->temp1.len != 0 && 0 == context->temp1.comp_data[i].seg_len) ||
                (context->temp2.len != 0 && 0 == context->temp2.comp_data[i].seg_len))
        {
            continue;
        }
        if (-1 == *temp_min)
        {
            *temp_min = i;
        }
        if (-1 == *temp_max || i > *temp_max)
        {
            *temp_max = i;
        }
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 get_supported_mode(UINT8* supported_mode)
{
    UINT8 i = 0;
    if (NULL == supported_mode)
    {
        return IR_DECODE_FAILED;
    }
    *supported_mode = 0x1F;

    for (i = 0; i < AC_MODE_MAX; i++)
    {
        if (0 == context->n_mode[i].enable ||
                (context->mode1.len != 0 && 0 == context->mode1.comp_data[i].seg_len) ||
                (context->mode2.len != 0 && 0 == context->mode2.comp_data[i].seg_len))
        {
            *supported_mode &= ~(1 << i);
        }
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 get_supported_wind_speed(UINT8 ac_mode, UINT8* supported_wind_speed)
{
    UINT8 i = 0;
    if (ac_mode >= AC_MODE_MAX)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == supported_wind_speed)
    {
        return IR_DECODE_FAILED;
    }

    if (1 == context->n_mode[ac_mode].allspeed)
    {
        *supported_wind_speed = 0;
        return IR_DECODE_SUCCEEDED;
    }

    *supported_wind_speed = 0x0F;

    for (i = 0; i < AC_WS_MAX; i++)
    {
        if (isin(context->n_mode[ac_mode].speed, i, context->n_mode[ac_mode].speed_cnt) ||
            (context->speed1.len != 0 && 0 == context->speed1.comp_data[i].seg_len) ||
            (context->speed2.len != 0 && 0 == context->speed2.comp_data[i].seg_len))
        {
            *supported_wind_speed &= ~(1 << i);
        }
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 get_supported_swing(UINT8 ac_mode, UINT8* supported_swing)
{
    if (ac_mode >= AC_MODE_MAX)
    {
        return IR_DECODE_FAILED;
    }

    if (NULL == supported_swing)
    {
        return IR_DECODE_FAILED;
    }

    if (context->si.type == SWING_TYPE_NORMAL)
    {
        *supported_swing = 0x03;
    }
    else if (context->si.type == SWING_TYPE_SWING_ONLY)
    {
        *supported_swing = 0x02;
    }
    else if (context->si.type == SWING_TYPE_NOT_SPECIFIED)
    {
        *supported_swing = 0x00;
    }
    else
    {
        *supported_swing = 0x01;
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 get_supported_wind_direction(UINT8* supported_wind_direction)
{
    if (NULL != context)
    {
        *supported_wind_direction = context->si.mode_count - 1;
        return IR_DECODE_SUCCEEDED;
    }
    else
    {
        return IR_DECODE_FAILED;
    }
}

///////////////////////////////////////////////// Air Conditioner End /////////////////////////////////////////////////

///////////////////////////////////////////////// TV Begin /////////////////////////////////////////////////

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 binary_tv_open(const char *file)
{
    int print_index = 0;
    FILE *stream = fopen(file, "rb");

    IR_PRINTF("file name = %s\n", file);

    if (stream == NULL)
    {
        IR_PRINTF("\nfile open failed : %d\n", errno);
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_END);
    tv_bin_length = ftell(stream);

    IR_PRINTF("length of binary = %d\n", tv_bin_length);

    fseek(stream, 0, SEEK_SET);
    fread(tv_bin, tv_bin_length, 1, stream);
    fclose(stream);

    // have some debug
    IR_PRINTF("=============================\n");
    // IR_PRINTF("length of binary = %d\n", tv_bin_length);
    for(print_index = 0; print_index < tv_bin_length; print_index++)
    {
        IR_PRINTF("%02X ", tv_bin[print_index]);
    }
    IR_PRINTF("\n=============================\n");
    irda_lib_open(tv_bin, tv_bin_length);
    return IR_DECODE_SUCCEEDED;
}
#endif

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 irda_tv_lib_open(const char *file_name)
{
    return binary_tv_open(file_name);
}
#else
INT8 irda_tv_lib_open(UINT8 *binary_file, UINT16 binary_length)
{
    irda_lib_open(binary_file, binary_length);
    return IR_DECODE_SUCCEEDED;
}
#endif

#if (defined BOARD_PC)|| (defined BOARD_MT6580)
INT8 irda_tv_lib_parse(UINT8 irda_hex_encode)
{
    if (FALSE == irda_lib_parse(irda_hex_encode))
    {
        IR_PRINTF("parse irda binary failed\n");
        memset(tv_bin, 0x00, EXPECTED_MEM_SIZE);
        tv_bin_length = 0;
        return IR_DECODE_FAILED;
    }
    IR_PRINTF("parse irda binary successfully\n");
    return IR_DECODE_SUCCEEDED;
}

UINT16 irda_tv_lib_control(UINT8 key, UINT16* l_user_data)
{
    UINT16 print_index = 0;
    UINT16 irda_code_length = 0;
    memset(user_data, 0x00, USER_DATA_SIZE);
    irda_code_length = irda_lib_control(key, l_user_data);

    // have some debug
    IR_PRINTF("=============================\n");
    IR_PRINTF("length of IRDA code = %d\n", irda_code_length);
    for(print_index = 0; print_index < irda_code_length; print_index++)
    {
        IR_PRINTF("%d ", user_data[print_index]);
    }
    IR_PRINTF("\n=============================\n\n");

    return irda_code_length;
}

UINT16 irda_tv_lib_close()
{
    // no need to close tv binary
}
#endif

///////////////////////////////////////////////// TV End /////////////////////////////////////////////////

///////////////////////////////////////////////// BLE Central Begin /////////////////////////////////////////////////

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 binary_ble_open(const char *file)
{
    FILE *stream = fopen(file, "rb");
    if (stream == NULL)
    {
        return IR_DECODE_FAILED;
    }

    fseek(stream, 0, SEEK_END);
    pirda_buffer->len = ftell(stream);

    fseek(stream, 0, SEEK_SET);
    fread(pirda_buffer->data, pirda_buffer->len, 1, stream);
    fclose(stream);

    return IR_DECODE_SUCCEEDED;
}
#endif

INT8 binary_bc_parse_offset()
{
    int i = 0;
    UINT16 *phead = (UINT16 *) &pirda_buffer->data[1];

    tag_count = pirda_buffer->data[0];
    if(TAG_COUNT_FOR_BC_PROTOCOL != tag_count)
    {
        return IR_DECODE_FAILED;
    }

    tag_head_offset = (tag_count << 1) + 1;

    tags = (t_tag_head *) irda_malloc(tag_count * sizeof(t_tag_head));
    if (NULL == tags)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < tag_count; i++)
    {
        tags[i].tag = bc_tag_index[i];
        tags[i].offset = *(phead + i);
        if (tags[i].offset == TAG_INVALID)
        {
            tags[i].len = 0;
        }
    }
    return IR_DECODE_SUCCEEDED;
}

// might be merged with function binary_parse_len
INT8 binary_bc_parse_len()
{
    UINT16 i = 0, j = 0;
    for (i = 0; i < (tag_count - 1); i++)
    {
        if (tags[i].offset == TAG_INVALID)
        {
            continue;
        }

        for (j = (i + 1); j < tag_count; j++)
        {
            if (tags[j].offset != TAG_INVALID)
            {
                break;
            }
        }
        if (j < tag_count)
        {
            tags[i].len = tags[j].offset - tags[i].offset;
        }
        else
        {
            tags[i].len = pirda_buffer->len - tags[i].offset - tag_head_offset;
            return IR_DECODE_SUCCEEDED;
        }
    }
    if (tags[tag_count - 1].offset != TAG_INVALID)
    {
        tags[tag_count - 1].len = pirda_buffer->len - tag_head_offset - tags[tag_count - 1].offset;
    }

    return IR_DECODE_SUCCEEDED;
}

// might be merged with function binary_parse_data
INT8 binary_bc_parse_data()
{
    UINT16 i = 0;
    for (i = 0; i < tag_count; i++)
    {
        tags[i].pdata = pirda_buffer->data + tags[i].offset + tag_head_offset;
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 free_bc_context()
{
    UINT8 i = 0;

    if (NULL != context_bc->device_name)
    {
        irda_free(context_bc->device_name);
        context_bc->device_name = NULL;
    }

    if (NULL != context_bc->conn_ack.commands)
    {
        irda_free(context_bc->conn_ack.commands);
        context_bc->conn_ack.commands = NULL;
    }
    context_bc->conn_ack.seg_count = 0;

    for (i = 0; i < KEY_COUNT; i++)
    {
        if (NULL != context_bc->generic_command[i].commands)
        {
            irda_free(context_bc->generic_command[i].commands);
            context_bc->generic_command[i].commands = NULL;
        }
        context_bc->generic_command[i].seg_count = 0;
    }
    return IR_DECODE_SUCCEEDED;
}

#if (defined BOARD_PC) || (defined BOARD_MT6580)
INT8 bc_lib_open(const char *file_name)
{
    return binary_ble_open(file_name);
}
#else
INT8 bc_lib_open(UINT8 *binary_file, UINT16 binary_length)
{
    // load bin to buffer
    pirda_buffer->data = binary_file;
    pirda_buffer->len = binary_length;
    pirda_buffer->offset = 0;
    return IR_DECODE_SUCCEEDED;
}
#endif

INT8 bc_context_init()
{
    irda_memset(context_bc, 0, sizeof(t_bc_protocol));
    return IR_DECODE_SUCCEEDED;
}

INT8 bc_lib_parse()
{
    UINT16 i = 0;
    // suggest not to call init function here for de-couple purpose
#if defined BOARD_CC254X
    bc_context_init();
#endif
    if (IR_DECODE_FAILED == binary_bc_parse_offset())
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == binary_bc_parse_len())
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == binary_bc_parse_data())
    {
        return IR_DECODE_FAILED;
    }

#if (defined BOARD_PC)|| (defined BOARD_MT6580)
    binary_tags_info();
#endif

    // parse tags
    for (i = 0; i < tag_count; i++)
    {
        if (tags[i].len == 0)
        {
            continue;
        }
        if (tags[i].tag == TAG_BC_BLE_NAME)
        {
            context_bc->device_name = (char*)irda_malloc(tags[i].len + 1);
            irda_memset(context_bc->device_name, 0x00, tags[i].len + 1);
            if (IR_DECODE_FAILED == parse_ble_name(tags[i].pdata, tags[i].len, context_bc->device_name))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_BC_NEED_CONN_ACK)
        {
            if (IR_DECODE_FAILED == parse_ble_need_conn_ack(tags[i].pdata, &context_bc->need_connection_ack))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_BC_NAME_LENGTH)
        {
            if (IR_DECODE_FAILED == parse_ble_name_length(tags[i].pdata, &context_bc->name_length))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_BC_NAME_ESS_LENGTH)
        {
            if (IR_DECODE_FAILED == parse_ble_name_essential_length(tags[i].pdata, &context_bc->name_essential_length))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag == TAG_BC_CONN_ACK_CMD)
        {
            if (IR_DECODE_FAILED == parse_ble_commands(&tags[i],
                                                       &context_bc->conn_ack))
            {
                return IR_DECODE_FAILED;
            }
        }
        else if (tags[i].tag >= TAG_BC_KEY_0_CMD && tags[i].tag <= TAG_BC_KEY_14_CMD)
        {
            if (IR_DECODE_FAILED == parse_ble_commands(&tags[i],
                                                       &context_bc->generic_command[tags[i].tag - TAG_BC_KEY_0_CMD]))
            {
                return IR_DECODE_FAILED;
            }
        }
    }

#if (defined BOARD_PC)|| (defined BOARD_MT6580)
    IR_PRINTF("\n=====================================\n");
    {
        IR_PRINTF("\n");
        IR_PRINTF("device name = %s\n", context_bc->device_name);
        IR_PRINTF("need ack per connected = %d\n", context_bc->need_connection_ack);
        IR_PRINTF("length of name = %d\n", context_bc->name_length);
        IR_PRINTF("essential length of name = %d\n", context_bc->name_essential_length);
        IR_PRINTF("conn ack segment count = %d\n", context_bc->conn_ack.seg_count);
    };
    IR_PRINTF("\n=====================================\n");
#endif

    if(NULL != tags)
    {
        irda_free(tags);
        tags = NULL;
    }

    return IR_DECODE_SUCCEEDED;
}

UINT16 bc_lib_control(int key_code, t_bc_commands* bc_commands)
{
#if (defined BOARD_PC)|| (defined BOARD_MT6580)
    UINT8 seg_index = 0;
    UINT8 i = 0;
    t_bc_commands key_command = context_bc->generic_command[key_code];

    for (seg_index = 0; seg_index < key_command.seg_count; seg_index++)
    {
        IR_PRINTF("send %d bytes of command with handle 0x%04X\n",
                  key_command.commands[seg_index].length,
                  key_command.commands[seg_index].handle);
        for(i = 0; i < key_command.commands[seg_index].length; i++)
        {
            IR_PRINTF("[%02X] ", key_command.commands[seg_index].command[i]);
        }
    }

    IR_PRINTF("\n");
    return 0;
#else
    if (NULL == bc_commands)
    {
        return IR_DECODE_FAILED;
    }
    // CC254X would load some data from flash to complete this procedure
    // TODO:

	return IR_DECODE_SUCCEEDED;
#endif
}

void bc_lib_close()
{
    if (NULL != tags)
    {
        irda_free(tags);
        tags = NULL;
    }
    // free context
    free_bc_context();
    return;
}

// utils
int get_valid_keys(int *valid_keys)
{
    int i = 0;
    for (i = 0; i < KEY_COUNT; i++)
    {
        if (context_bc->generic_command[i].seg_count != 0)
        {
            valid_keys[i] = 1;
        }
        else
        {
            valid_keys[i] = 0;
        }
    }
    return KEY_COUNT;
}
///////////////////////////////////////////////// BLE Central End /////////////////////////////////////////////////

///////////////////////////////////////////////// Decode Test Begin /////////////////////////////////////////////////
#if (defined BOARD_PC) || (defined BOARD_MT6580)

UINT8 decode_as_ac(char *file_name)
{
    // keyboard input
    int in_char = 0;
    int count = 0;
    BOOL op_match = TRUE;
    UINT8 function_code = AC_FUNCTION_MAX;

    // get status
    UINT8 supported_mode = 0x00;
    UINT8 min_temperature = 0;
    UINT8 max_temperature = 0;
    UINT8 supported_speed = 0x00;
    UINT8 supported_swing = 0x00;

    BOOL need_control = TRUE;

    // init air conditioner status
    ac_status.acDisplay = 0;
    ac_status.acSleep = 0;
    ac_status.acTimer = 0;
    ac_status.acPower = AC_POWER_OFF;
    ac_status.acMode = AC_MODE_COOL;
    ac_status.acTemp = AC_TEMP_20;
    ac_status.acWindDir = AC_SWING_ON;
    ac_status.acWindSpeed = AC_WS_AUTO;

    if (IR_DECODE_FAILED == irda_ac_lib_open(file_name))
    {
        irda_ac_lib_close();
        return IR_DECODE_FAILED;
    }

    // no need to verify return value
    irda_context_init();

    if (IR_DECODE_FAILED == irda_ac_lib_parse())
    {
        IR_PRINTF("\nac lib parse failed\n");
        irda_ac_lib_close();
        return IR_DECODE_FAILED;
    }
    do
    {
        in_char = getchar();
        op_match = TRUE;
        need_control = TRUE;
        switch(in_char)
        {
            case 'w':
            case 'W':
                // temperature plus
                ac_status.acTemp = (ac_status.acTemp == AC_TEMP_30) ? AC_TEMP_30 : (ac_status.acTemp + 1);
                function_code = AC_FUNCTION_TEMPERATURE_UP;
                break;
            case 's':
            case 'S':
                ac_status.acTemp = (ac_status.acTemp == AC_TEMP_16) ? AC_TEMP_16 : (ac_status.acTemp - 1);
                function_code = AC_FUNCTION_TEMPERATURE_DOWN;
                // temperature minus
                break;
            case 'a':
            case 'A':
                ++ac_status.acWindSpeed;
                ac_status.acWindSpeed = ac_status.acWindSpeed % AC_WS_MAX;
                function_code = AC_FUNCTION_WIND_SPEED;
                // wind speed loop
                break;
            case 'd':
            case 'D':
                ac_status.acWindDir = (ac_status.acWindDir == 0) ? 1 : 0;
                function_code = AC_FUNCTION_WIND_SWING;
                // wind swing loop
                break;
            case 'q':
            case 'Q':
                ++ac_status.acMode;
                ac_status.acMode = ac_status.acMode % AC_MODE_MAX;
                function_code = AC_FUNCTION_MODE;
                break;
            case '1':
                // turn on
                ac_status.acPower = AC_POWER_ON;
                function_code = AC_FUNCTION_POWER;
                break;
            case '2':
                // turn off
                ac_status.acPower = AC_POWER_OFF;
                // FUNCTION MAX refers to power off
                // function_code = AC_FUNCTION_POWER;
                break;
            case '3':
                if (IR_DECODE_SUCCEEDED == get_supported_mode(&supported_mode))
                {
                    IR_PRINTF("\nsupported mode = %02X\n", supported_mode);
                }
                need_control = FALSE;
                break;

            case '4':
                if (IR_DECODE_SUCCEEDED == get_supported_swing(ac_status.acMode, &supported_swing))
                {
                    IR_PRINTF("\nsupported swing in %d = %02X\n", ac_status.acMode, supported_swing);
                }
                need_control = FALSE;
                break;
            case '5':
                if (IR_DECODE_SUCCEEDED == get_supported_wind_speed(ac_status.acMode, &supported_speed))
                {
                    IR_PRINTF("\nsupported wind speed in %d = %02X\n", ac_status.acMode, supported_speed);
                }
                need_control = FALSE;
                break;

            case '6':
                if (IR_DECODE_SUCCEEDED == get_temperature_range(ac_status.acMode, &min_temperature, &max_temperature))
                {
                    IR_PRINTF("\nsupported temperature range in mode %d = %d, %d\n", ac_status.acMode, min_temperature, max_temperature);
                }
                need_control = FALSE;
                break;

            default:
                op_match = FALSE;
                break;
        }

        if(TRUE == op_match && TRUE == need_control)
        {
            IR_PRINTF("switch AC to power = %d, mode = %d, temp = %d, speed = %d, swing = %d\n",
                      ac_status.acPower,
                      ac_status.acMode,
                      ac_status.acTemp,
                      ac_status.acWindSpeed,
                      ac_status.acWindDir
            );

            irda_ac_lib_control(ac_status, user_data, function_code, TRUE);
        }
    } while('0' != in_char);

    irda_ac_lib_close();

    return IR_DECODE_SUCCEEDED;
}

UINT8 decode_as_tv(char *file_name, UINT8 irda_hex_encode)
{
    // keyboard input
    int in_char = 0;
    int key_code = -1;
    int count = 0;

    if (IR_DECODE_FAILED == irda_tv_lib_open(file_name))
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == irda_tv_lib_parse(irda_hex_encode))
    {
        return IR_DECODE_FAILED;
    }
    do
    {
        in_char = getchar();
        if (in_char >= '0' && in_char <= '9')
        {
            key_code = in_char - '0';
            irda_tv_lib_control(key_code, user_data);
        }
        else if (in_char >= 'a' && in_char <= 'f')
        {
            key_code = 10 + (in_char - 'a');
            irda_tv_lib_control(key_code, user_data);
        }
        else if (in_char == 'q')
        {
            irda_tv_lib_close();
        }
        else
        {
            // do nothing
        }
    } while('Q' != in_char);

    return IR_DECODE_SUCCEEDED;
}

UINT8 decode_as_ble_central(char *file_name)
{
    // keyboard input
    int in_char = 0;
    int count = 0;
    int key_code = -1;
    BOOL op_match = TRUE;

    if (IR_DECODE_FAILED == bc_lib_open(file_name))
    {
        bc_lib_close();
        return IR_DECODE_FAILED;
    }

    // no need to verify return value
    bc_context_init();

    if (IR_DECODE_FAILED == bc_lib_parse())
    {
        bc_lib_close();
        return IR_DECODE_FAILED;
    }
    do
    {
        in_char = getchar();
        if (in_char >= '0' && in_char <= '9')
        {
            key_code = in_char - '0';
            bc_lib_control(key_code, NULL);
        }
        else if (in_char >= 'a' && in_char <= 'f')
        {
            key_code = 10 + (in_char - 'a');
            bc_lib_control(key_code, NULL);
        }
        else
        {
            // do nothing
        }
    } while('Q' != in_char);

    bc_lib_close();

    return IR_DECODE_SUCCEEDED;
}

#endif

#if defined BOARD_PC

int main(int argc, char *argv[])
{
    char function = '0';
    UINT8 irda_hex_encode = 0;

    if (4 != argc)
    {
        IR_PRINTF("number of args error !\n");
        return -1;
    }

    function = argv[1][0];
    irda_hex_encode = (UINT8)(argv[3][0] - '0');
    IR_PRINTF("decode functionality = %c\n", function);

    switch (function)
    {
        case '0':
            IR_PRINTF("decode binary file as AC\n");
            decode_as_ac(argv[2]);
            break;

        case '1':
            IR_PRINTF("decode binary file as TV : %d\n", irda_hex_encode);
            decode_as_tv(argv[2], irda_hex_encode);
            break;

        case '2':
            IR_PRINTF("decode binary file as BLE CENTRAL\n");
            decode_as_ble_central(argv[2]);
            break;

        default:
            IR_PRINTF("decode functionality error !\n");
            break;
    }
}

#endif

///////////////////////////////////////////////// Decode Test End /////////////////////////////////////////////////