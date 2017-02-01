/**************************************************************************************
Filename:       buffer.c
Revised:        Date: 2017-01-01
Revision:       Revision: 1.0

Description:    This file provides basic buffer support for queue

Revision log:
* 2017-01-01: created by strawmanbobi
**************************************************************************************/


#include "bcomdef.h"
#include "util.h"
#include "stdio.h"
#include "string.h"
#include "buffer.h"

static char sendBufForUsart[SEND_BUF_MAX_SIZE] = {0};         // usart send buffer.
static unsigned short sendWrite = 0;                          // usart send buffer write position.
static unsigned short sendRead = 0;                           // usart send buffer read position.

bool queue_write(uint8 *WrBuf, unsigned short WrLen)
{
    unsigned short emptyLen;
    unsigned short tmpAddr;
    unsigned short tmpLen;

    emptyLen = (sendRead + SEND_BUF_MAX_SIZE - (sendWrite + 1)) % SEND_BUF_MAX_SIZE;
    if (emptyLen >= WrLen)
    {
        tmpAddr = (sendWrite + WrLen) % SEND_BUF_MAX_SIZE;
        if (tmpAddr <= sendWrite)
        {
            tmpLen = WrLen - tmpAddr;
            memcpy(&sendBufForUsart[sendWrite], WrBuf, tmpLen);
            memcpy(&sendBufForUsart[0], WrBuf+tmpLen, tmpAddr);
        }
        else
        {
            memcpy(&sendBufForUsart[sendWrite], WrBuf, WrLen);
        }

        sendWrite = tmpAddr;

        return TRUE;
    }

    return FALSE;
}

unsigned short queue_read(uint8 *RdBuf, unsigned short RdLen)
{
    unsigned short validLen;
    unsigned short tmpAddr;
    unsigned short tmpLen;

    validLen = (sendWrite + SEND_BUF_MAX_SIZE - sendRead) % SEND_BUF_MAX_SIZE;

    if(validLen == 0)
        return 0;

    if (validLen < RdLen)
        RdLen = validLen;

    if (validLen >= RdLen)
    {
        tmpAddr = (sendRead + RdLen) % SEND_BUF_MAX_SIZE;
        if (tmpAddr <= sendRead)
        {
            tmpLen = RdLen - tmpAddr;
            memcpy(RdBuf, &sendBufForUsart[sendRead], tmpLen);
            memcpy(RdBuf + tmpLen, &sendBufForUsart[0], tmpAddr);
        }
        else
        {
            memcpy(RdBuf, &sendBufForUsart[sendRead], RdLen);
        }
        sendRead = tmpAddr;

    }

    return RdLen;
}

unsigned short queue_total()
{
    unsigned short validLen;

    validLen = (sendWrite + SEND_BUF_MAX_SIZE - sendRead) % SEND_BUF_MAX_SIZE;

    return validLen;
}

void queue_clear()
{
    sendWrite = 0;                          //usart send buffer write position.
    sendRead = 0;                           //usart send buffer read position.
}

/*********************************************************************
*********************************************************************/
