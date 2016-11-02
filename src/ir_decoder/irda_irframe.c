/**************************************************************************************************
Filename:       irda_irframe.c
Revised:        Date: 2015-08-01
Revision:       Revision: 1.0

Description:    This file provides algorithms for UCON IR decode

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2015-08-01: created by strawmanbobi
**************************************************************************************************/
#include <stdio.h>

#include "irda_irframe.h"
#include "ucon_decode.h"

extern protocol* context;

//return bit number per byte,default value is 8
UINT8 bits_per_byte(UINT8 index)
{
    UINT8 i = 0;
    UINT8 size = 0;

    if (context->bitnum_cnt == 0)
        return 8; //defaut value

    if (context->bitnum_cnt >= MAX_BITNUM)
        size = MAX_BITNUM;
    else
        size = context->bitnum_cnt;

    for (i = 0; i < size; i++)
    {
        if (context->bitnum[i].pos == index)
            return context->bitnum[i].bits;
        if (context->bitnum[i].pos > index)
            return 8;
    }
    return 8;
}

UINT16 add_delaycode(UINT8 index)
{
    UINT8 i = 0, j = 0;
    UINT8 size = 0;
    UINT8 tail_delaycode = 0;
    UINT16 tail_pos = 0;

/* updated by xiangjiang - 2015-08-31 - begin */
#if 0
    //Handle TAG307
    if ((context->lastbit == 0) && (index == (ir_hex_len - 1)))
    {
        context->time[context->code_cnt++] = context->one.low; //high
    }

    if (context->dc_cnt == 0)
        return 0;
    else
        size = context->dc_cnt;

    for (i = 0; i < size; i++)
    {

        if (context->dc[i].pos == index)
        {
            for (j = 0; j < context->dc[i].time_cnt; j++)
            {
                context->time[context->code_cnt++] = context->dc[i].time[j];
            }
            return context->dc[i].time_cnt;
        }
    }
    return 0;
#else

    if(context->dc_cnt != 0)
    {
        size = context->dc_cnt;

        for (i = 0; i < size; i++)
        {
            if (context->dc[i].pos == index)
            {
                for (j = 0; j < context->dc[i].time_cnt; j++)
                {
                    context->time[context->code_cnt++] = context->dc[i].time[j];
                }
            }
            else if(context->dc[i].pos == -1)
            {
                tail_delaycode = 1;
                tail_pos = i;
            }
        }
    }

    //Handle TAG307
    if ((context->lastbit == 0) && (index == (ir_hex_len - 1)))
    {
        context->time[context->code_cnt++] = context->one.low; //high
    }

    if(context->dc_cnt != 0)
    {
        if((index == (ir_hex_len - 1)) && (tail_delaycode == 1))
        {
            for (i = 0; i < context->dc[tail_pos].time_cnt; i++)
            {
                context->time[context->code_cnt++] = context->dc[tail_pos].time[i];
            }
        }
    }

    return context->dc[i].time_cnt;
#endif
/* updated by xiangjiang - 2015-08-31 - end */
}

UINT16 create_ir_frame()
{
    UINT16 i = 0, j = 0;
    UINT8 bitnum = 0;
    UINT8 *irdata = ir_hex_code;
    UINT8 mask = 1;
    UINT16 framelen = 0;

    context->code_cnt = 0;

    //bootcode
    for (i = 0; i < context->bootcode.len; i++)
    {
        //IR_PRINTF("%d,",context->bootcode.data[i]); //tag[300]
        context->time[context->code_cnt++] = context->bootcode.data[i];
    }
    //code_cnt += context->bootcode.len;

    for (i = 0; i < ir_hex_len; i++)
    {
        bitnum = bits_per_byte(i);//use tag[1509]
        //IR_PRINTF("bitnum:%d\n", bitnum);
        for (j = 0; j < bitnum; j++)
        {
            if (context->endian == 0) //BIg Endian
                mask = (1 << (bitnum - 1)) >> j;
            else
                mask = 1 << j; //Little Endian

            if (irdata[i] & mask)
            {
                //one[302]
                //IR_PRINTF("%d,%d,", context->one.low, context->one.high);
                context->time[context->code_cnt++] = context->one.low;
                context->time[context->code_cnt++] = context->one.high;
            }
            else
            {
                //zero[301]
                //IR_PRINTF("%d,%d,", context->zero.low, context->zero.high);
                context->time[context->code_cnt++] = context->zero.low;
                context->time[context->code_cnt++] = context->zero.high;
            }
        }
        add_delaycode(i);
    }

    framelen = context->code_cnt;

    for (i = 0; i < (context->repeat_times - 1); i++)
    {
        for (j = 0; j < framelen; j++)
        {
            context->time[context->code_cnt++] = context->time[j];
        }
    }

#if (defined BOARD_PC) || (defined BOARD_MT6580)
    for (i = 0; i < context->code_cnt; i++)
    {
        IR_PRINTF("%d,", context->time[i]);
    }
    IR_PRINTF("\n");
#endif

    return context->code_cnt;
}


