/*******************************************************************************
  Filename:       board_uart.c
  Revised:        $Date: 2014-03-10 07:29:12 -0700 (Mon, 10 Mar 2014) $
  Revision:       $Revision: 37597 $

  Description:    This file contains the interface to the UART driver.

  Copyright 2014 Texas Instruments Incorporated. All rights reserved.

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

/*********************************************************************
 * INCLUDES
 */
#include <string.h>
#include <stdio.h>

#include <ti/sysbios/knl/Task.h>
#include <ti/sysbios/knl/Clock.h>
#include <ti/sysbios/knl/Semaphore.h>
#include <ti/sysbios/knl/Queue.h>

#include "hci_tl.h"
#include "gatt.h"
#include "gapgattserver.h"
#include "gattservapp.h"
#include "devinfoservice.h"

#if defined(SENSORTAG_HW)
#include "bsp_spi.h"
#endif // SENSORTAG_HW

#if defined(FEATURE_OAD) || defined(IMAGE_INVALIDATE)
#include "oad_target.h"
#include "oad.h"
#endif //FEATURE_OAD || IMAGE_INVALIDATE

#include "peripheral.h"
#include "gapbondmgr.h"

#include "osal_snv.h"
#include "ICallBleAPIMSG.h"

#include <driverlib/ioc.h>
#include <driverlib/gpio.h>
#include <driverlib/timer.h>


#include "Board.h"

#include "osal.h"
#include "board_uart.h"
#include "board_LCD.h"
#include "utils.h"

#include "../../npi/inc/npi_tl_uart.h"


#if defined NPI_USE_UART

static char tRxBuf[256] = { 0 };
static char tTxBuf[256] = { 0 };

static bool uartInitFlag = FALSE;

void Uart_Init(npiCB_t npiCBack)
{
    if(!uartInitFlag)
    {
        NPITLUART_initializeTransport(tRxBuf, tTxBuf, npiCBack);
        uartInitFlag = TRUE;

#if defined UART_DEBUG
        sprintf(tTxBuf, "NPITLUART_initialize\n");
        NPITLUART_writeTransport(strlen(tTxBuf));
#endif
    }
}

void UART_WriteTransport (uint8 *str, uint8 len)
{
    if(uartInitFlag)
    {
        memcpy(tTxBuf, str, len);
        NPITLUART_writeTransport(len);
    }
}

uint8 *UART_GetRxBufferAddress()
{
    return (uint8*)tRxBuf;
}

void UART_DLY_ms(unsigned int ms)
{
    unsigned int a;
    while(ms)
    {
        a = 1800;
        while(a--) ;
        ms--;
    }
    return;
}

void PrintString(uint8 *str)
{
#if defined UART_DEBUG
    UART_WriteTransport(str, (strlen((char*)str)));
    UART_DLY_ms(10);
#endif
}


void PrintValue(char *content, uint32 value, uint8 format)
{
#if defined UART_DEBUG
    uint8 tmpLen;
    uint8 buf[UART_BUFFER_SIZE];
    uint32 err;

    tmpLen = (uint8)strlen((char*)content);
    memcpy(buf, content, tmpLen);
    err = (uint32)(value);
    _ltoa(err, &buf[tmpLen], format);
    PrintString(buf);
    UART_DLY_ms(10);
#endif
}


void WriteBytes(uint8 *data, uint16_t len)
{
	UART_WriteTransport(data, len);
}

void WriteValue(char *content, uint32 value, uint8 format)
{
    uint8 tmpLen;
    char buf[UART_BUFFER_SIZE];
    uint32 err;

    tmpLen = (uint8)strlen((char*)content);
    memcpy(buf, content, tmpLen);
    err = (uint32)(value);
    _ltoa(err, (uint8*)&buf[tmpLen], format);
    WriteBytes((uint8*)buf, strlen(buf));
}

#endif


