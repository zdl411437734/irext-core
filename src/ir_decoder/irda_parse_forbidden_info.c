/**************************************************************************************************
Filename:       irda_parse_forbidden_info.c
Revised:        Date: 2016-10-05
Revision:       Revision: 1.0

Description:    This file provides algorithms for IR decode for TAG 150x

Revision log:
* 2016-10-05: created by strawmanbobi
**************************************************************************************************/

/*
 *inclusion
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "./include/irda_decode.h"
#include "./include/irda_utils.h"
#include "./include/irda_parse_forbidden_info.h"
/*
 * global vars
 */

/*
 * external vars
 */
extern protocol* context;

/*
 * function declaration
 */

/*
 * function definition
 */
INT8 parse_nmode_150x_data_speed(char *pdata, ac_n_mode seq)
{
    char buf[16] = {0};
    char *p = pdata;
    UINT16 pos = 0;
    UINT16 cnt = 0, index = 0;

    while (index <= irda_strlen(pdata))
    {
        while ((index != irda_strlen(pdata)) && (*(p++) != ','))
        {
            index++;
        }
        irda_memcpy(buf, pdata + pos, index - pos);
        pos = index + 1;
        index = pos;
        context->n_mode[seq].speed[cnt++] = atoi(buf);
        context->n_mode[seq].speed_cnt = cnt;
        irda_memset(buf, 0, 16);
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_nmode_150x_data_temp(char *pdata, ac_n_mode seq)
{

    char buf[16] = {0};
    char *p = pdata;
    UINT16 pos = 0;
    UINT16 cnt = 0, index = 0;

    while (index <= irda_strlen(pdata))
    {
        while ((index != irda_strlen(pdata)) && (*(p++) != ','))
        {
            index++;
        }
        irda_memcpy(buf, pdata + pos, index - pos);
        pos = index + 1;
        index = pos;
        context->n_mode[seq].temp[cnt++] = atoi(buf) - 16;
        context->n_mode[seq].temp_cnt = cnt;
        irda_memset(buf, 0, 16);
    }
    return IR_DECODE_SUCCEEDED;
}

INT8 parse_nmode_150x_pos(char *buf, ac_n_mode index)
{
    UINT16 i = 0;
    char data[64] = {0};
    // char start[8] = {0};
    if (irda_strlen(buf) == 1)
    {
        if (buf[0] == 'S' || buf[0] == 's')
        {
            context->n_mode[index].allspeed = 1;
        }
        else if (buf[0] == 'T' || buf[0] == 't')
        {
            context->n_mode[index].alltemp = 1;
        }
        return IR_DECODE_SUCCEEDED;
    }

    for (i = 0; i < irda_strlen(buf); i++)
    {
        if (buf[i] == '&')
        {
            irda_memcpy(data, buf + i + 1, irda_strlen(buf) - i - 1);
            break;
        }
    }
    if (buf[0] == 'S')
    {
        parse_nmode_150x_data_speed(data, index);
    }
    else 
    {
        parse_nmode_150x_data_temp(data, index);
    }

    return IR_DECODE_SUCCEEDED;
}

INT8 parse_nmode_150x(struct tag_head *tag, ac_n_mode index)
{
    UINT16 i = 0;
    UINT16 preindex = 0;

    char buf[64] = {0};

    if (tag->pdata[0] == 'N' && tag->pdata[1] == 'A')
    {
        // ban this function directly
        context->n_mode[index].enable = 0;
        return IR_DECODE_SUCCEEDED;
    }
    else
    {
        context->n_mode[index].enable = 1;
    }

    preindex = 0;
    for (i = 0; i < tag->len; i++)
    {
        if (tag->pdata[i] == '|')
        {
            irda_memcpy(buf, tag->pdata + preindex, i - preindex);
            preindex = i + 1;
            parse_nmode_150x_pos(buf, index);
            irda_memset(buf, 0, 64);
        }

    }
    irda_memcpy(buf, tag->pdata + preindex, i - preindex);
    parse_nmode_150x_pos(buf, index);
    irda_memset(buf, 0, 64);
    return IR_DECODE_SUCCEEDED;
}
