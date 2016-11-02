/**************************************************************************************************
Filename:       irda_parse_frame_parameter.c
Revised:        Date: 2015-08-11
Revision:       Revision: 1.0

Description:    This file provides algorithms for UCON IR decode for AC frame parameters

Copyright 2014-2016 UCON Tech all rights reserved

Revision log:
* 2015-08-11: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "irda_utils.h"
#include "irda_parse_frame_parameter.h"
#include "ucon_decode.h"

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
INT8 parse_bootcode_300(struct tag_head *tag)
{
    UINT8 buf[16] = {0};
    UINT8 *p = NULL;
    UINT16 pos = 0;
    UINT16 cnt = 0, index = 0;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    p = tag->pdata;

    if (NULL == p)
    {
        return IR_DECODE_FAILED;
    }

    while (index <= tag->len)
    {
        while ((index != (tag->len)) && (*(p++) != ','))
        {
            index++;
        }
        irda_memcpy(buf, tag->pdata + pos, index - pos);
        pos = index + 1;
        index = pos;
        context->bootcode.data[cnt++] = atoi((char *) buf);
        irda_memset(buf, 0, 16);
    }
    context->bootcode.len = cnt;
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_zero_301(struct tag_head *tag)
{
    UINT8 low[16] = {0};
    UINT8 high[16] = {0};
    UINT16 index = 0;
    UINT8 *p = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    p = tag->pdata;

    if (NULL == p)
    {
        return IR_DECODE_FAILED;
    }

    while (*(p++) != ',')
    {
        index++;
    }

    irda_memcpy(low, tag->pdata, index);
    irda_memcpy(high, tag->pdata + index + 1, tag->len - index - 1);

    context->zero.low = atoi((char *) low);
    context->zero.high = atoi((char *) high);
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_one_302(struct tag_head *tag)
{
    UINT8 low[16] = {0};
    UINT8 high[16] = {0};
    UINT16 index = 0;
    UINT8 *p = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    p = tag->pdata;

    if (NULL == p)
    {
        return IR_DECODE_FAILED;
    }

    while (*(p++) != ',')
    {
        index++;
    }
    irda_memcpy(low, tag->pdata, index);
    irda_memcpy(high, tag->pdata + index + 1, tag->len - index - 1);

    context->one.low = atoi((char *) low);
    context->one.high = atoi((char *) high);

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_delaycode_303_data(UINT8 *pdata)
{
    UINT8 buf[16] = {0};
    UINT8 *p = NULL;
    UINT16 pos = 0;
    UINT16 cnt = 0, index = 0;

    if (NULL == pdata)
    {
        return IR_DECODE_FAILED;
    }
    p = pdata;

    while (index <= irda_strlen((char *) pdata))
    {
        while ((index != irda_strlen((char *) pdata)) && (*(p++) != ','))
        {
            index++;
        }
        irda_memcpy(buf, pdata + pos, index - pos);
        pos = index + 1;
        index = pos;
        context->dc[context->dc_cnt].time[cnt++] = atoi((char *) buf);
        context->dc[context->dc_cnt].time_cnt = cnt;
        irda_memset(buf, 0, 16);
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_delaycode_303_pos(UINT8 *buf)
{
    UINT16 i = 0;
    UINT8 data[64] = {0}, start[8] = {0};

    if (NULL == buf)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < irda_strlen((char *) buf); i++)
    {
        if (buf[i] == '&')
        {
            irda_memcpy(start, buf, i);
            irda_memcpy(data, buf + i + 1, irda_strlen((char *) buf) - i - 1);
            break;
        }
    }
    parse_delaycode_303_data(data);
    context->dc[context->dc_cnt].pos = atoi((char *) start);

    context->dc_cnt++;
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_delaycode_303(struct tag_head *tag)
{
    UINT8 buf[64] = {0};
    UINT16 i = 0;
    UINT16 preindex = 0;
    preindex = 0;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < tag->len; i++)
    {
        if (tag->pdata[i] == '|')
        {
            irda_memcpy(buf, tag->pdata + preindex, i - preindex);
            preindex = i + 1;
            parse_delaycode_303_pos(buf);
            irda_memset(buf, 0, 64);
        }

    }
    irda_memcpy(buf, tag->pdata + preindex, i - preindex);
    parse_delaycode_303_pos(buf);
    irda_memset(buf, 0, 64);

    /* updated by xiangjiang - 2015-08-31 - begin */
#if 0
    for (i = 0; i < context->dc_cnt; i++)
    {
        if (context->dc[i].pos == -1)
        {
            context->dc[i].pos = (context->default_code.len - 1);
        }
    }
#endif
    /* updated by xiangjiang - 2015-08-31 - end */

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_framelen_304(struct tag_head *tag, UINT16 len)
{
    UINT8 *temp = NULL;

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    temp = (UINT8 *)irda_malloc(len + 1);

    if (NULL == temp)
    {
        return IR_DECODE_FAILED;
    }

    irda_memset(temp, 0x00, len + 1);

    irda_memcpy(temp, tag->pdata, len);
    temp[len] = '\0';

    context->frame_length = atoi((char *) temp);

    irda_free(temp);
    temp = NULL;
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_endian_306(struct tag_head *tag)
{
    UINT8 buf[8] = {0};

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    irda_memcpy(buf, tag->pdata, tag->len);
    context->endian = atoi((char *) buf);
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_lastbit_307(struct tag_head *tag)
{
    UINT8 buf[8] = {0};

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }
    irda_memcpy(buf, tag->pdata, tag->len);
    context->lastbit = atoi((char *) buf);
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_repeat_times_1508(struct tag_head *tag)
{
    char asc_code[8] = {0};
    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    irda_memcpy(asc_code, tag->pdata, tag->len);

    context->repeat_times = atoi((char *) asc_code);

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_delaycode_1509_pos(UINT8 *buf)
{
    UINT16 i = 0;
    UINT8 data[64] = {0}, start[8] = {0};

    if (NULL == buf)
    {
        return IR_DECODE_FAILED;
    }

    for (i = 0; i < irda_strlen((char *) buf); i++)
    {
        if (buf[i] == '&')
        {
            irda_memcpy(start, buf, i);
            irda_memcpy(data, buf + i + 1, irda_strlen((char *) buf) - i - 1);
            break;
        }
    }

    context->bitnum[context->bitnum_cnt].pos = atoi((char *) start);
    context->bitnum[context->bitnum_cnt].bits = atoi((char *) data);
    context->bitnum_cnt++;
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_bitnum_1509(struct tag_head *tag)
{
    UINT16 i = 0;
    UINT16 preindex = 0;
    UINT8 buf[64] = {0};

    if (NULL == tag)
    {
        return IR_DECODE_FAILED;
    }

    preindex = 0;
    for (i = 0; i < tag->len; i++)
    {
        if (tag->pdata[i] == '|')
        {
            irda_memcpy(buf, tag->pdata + preindex, i - preindex);
            preindex = i + 1;
            parse_delaycode_1509_pos(buf);
            irda_memset(buf, 0, 64);
        }

    }
    irda_memcpy(buf, tag->pdata + preindex, i - preindex);
    parse_delaycode_1509_pos(buf);
    irda_memset(buf, 0, 64);

    for (i = 0; i < context->bitnum_cnt; i++)
    {
        if (context->bitnum[i].pos == -1)
            context->bitnum[i].pos = (context->default_code.len - 1); //convert -1 to last data pos
    }
    return IR_DECODE_SUCCEEDED;
}
