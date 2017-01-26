/*******************************************************************************
  Filename:       buffer.c
  Revised:        $Date: 2016-01-07 16:59:59 -0800 (Thu, 07 Jan 2016) $
  Revision:       $Revision: 44594 $

  Description:    This file contains the Simple BLE Peripheral sample
                  application for use with the CC2650 Bluetooth Low Energy
                  Protocol Stack.

  Copyright 2013 - 2015 Texas Instruments Incorporated. All rights reserved.

  IMPORTANT: Your use of this Software is limited to those specific rights
  granted under the terms of a software license agreement between the user
  who downloaded the software, his/her employer (which must be your employer)
  and Texas Instruments Incorporated (the "License").  You may not use this
  Software unless you agree to abide by the terms of the License. The License
  limits your use, and you acknowledge, that the Software may not be modified,
  copied or distributed unless embedded on a Texas Instruments microcontroller
  or used solely and exclusively in conjunction with a Texas Instruments radio
  frequency transceiver, which is integrated into your product.  Other than for
  the foregoing purpose, you may not use, reproduce, copy, prepare derivative
  works of, modify, distribute, perform, display or sell this Software and/or
  its documentation for any purpose.

  YOU FURTHER ACKNOWLEDGE AND AGREE THAT THE SOFTWARE AND DOCUMENTATION ARE
  PROVIDED “AS IS?WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
  INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF MERCHANTABILITY, TITLE,
  NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL
  TEXAS INSTRUMENTS OR ITS LICENSORS BE LIABLE OR OBLIGATED UNDER CONTRACT,
  NEGLIGENCE, STRICT LIABILITY, CONTRIBUTION, BREACH OF WARRANTY, OR OTHER
  LEGAL EQUITABLE THEORY ANY DIRECT OR INDIRECT DAMAGES OR EXPENSES
  INCLUDING BUT NOT LIMITED TO ANY INCIDENTAL, SPECIAL, INDIRECT, PUNITIVE
  OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOST DATA, COST OF PROCUREMENT
  OF SUBSTITUTE GOODS, TECHNOLOGY, SERVICES, OR ANY CLAIMS BY THIRD PARTIES
  (INCLUDING BUT NOT LIMITED TO ANY DEFENSE THEREOF), OR OTHER SIMILAR COSTS.

  Should you have any questions regarding your right to use this Software,
  contact Texas Instruments Incorporated at www.TI.com.
*******************************************************************************/

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
            tmpLen =WrLen - tmpAddr;
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
