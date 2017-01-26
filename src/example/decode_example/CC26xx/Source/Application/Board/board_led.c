/*******************************************************************************
  Filename:       board_led.c
  Revised:        $Date: 2014-03-10 07:29:12 -0700 (Mon, 10 Mar 2014) $
  Revision:       $Revision: 37597 $

  Description:    This file contains the interface to the LED driver.

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

#include "osal_snv.h"
#include "board_led.h"
#include "Board.h"

static PIN_State  ledPins;
static PIN_Handle hledPins = NULL;

// PIN configuration structure to set all LED pins as output
PIN_Config ledPinsCfg[] =
{
    Board_LED1 | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
    Board_LED2 | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
    Board_LED3 | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
    Board_LED4 | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
    PIN_TERMINATE
};

void Board_initLeds()
{
  // Initialize KEY pins. Enable int after callback registered
  hledPins = PIN_open(&ledPins, ledPinsCfg);

#ifdef POWER_SAVING
  //Enable wakeup
#endif
}

void HalLedInit( void )
{
  if(NULL == hledPins)
  {
    Board_initLeds();
  }
}

uint8 HalLedSet( uint8 led, uint8 mode )
{
    uint8 i = 0;
    uint8 pin[4] = {Board_LED1, Board_LED2, Board_LED3, Board_LED4};

    if(NULL == hledPins)
    {
        Board_initLeds();
    }

    for(i = 0; i <= 3; i++)
    {
        if(led & (0x1 << i))
        {
            switch(mode)
            {
            case HAL_LED_MODE_OFF:
                PIN_setOutputValue(hledPins, pin[i], 0);
                break;
            case HAL_LED_MODE_ON:
                PIN_setOutputValue(hledPins, pin[i], 1);
                break;
            case HAL_LED_MODE_FLASH:
                    PIN_setOutputValue(hledPins, pin[i],  1);
                Task_sleep(10*1000/Clock_tickPeriod);
                PIN_setOutputValue(hledPins, pin[i], 0);
                break;

            case HAL_LED_MODE_TOGGLE:
                    PIN_setOutputValue(hledPins, pin[i], !PIN_getOutputValue(pin[i]));
                break;
            }
        }
    }
     return 0;
}






