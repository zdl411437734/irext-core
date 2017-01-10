/*******************************************************************************
  Filename:       board_key.c
  Revised:        $Date: 2014-03-10 07:29:12 -0700 (Mon, 10 Mar 2014) $
  Revision:       $Revision: 37597 $

  Description:    This file contains the interface to the SRF06EB Key Service.

  Copyright 2014 - 2015 Texas Instruments Incorporated. All rights reserved.

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
  PROVIDED “AS IS” WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
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
#include <stdbool.h>
#include <ti/sysbios/knl/Clock.h>
#include <ti/sysbios/family/arm/m3/Hwi.h>
#include <ti/sysbios/knl/Semaphore.h>
#include <ti/sysbios/knl/Queue.h>

#include <ti/drivers/pin/PINCC26XX.h>

#ifdef USE_ICALL
#include <ICall.h>
#endif
   
#include <inc/hw_ints.h>
#include "bcomdef.h"

#include "util.h"
#include "board_key.h"
#include "Board.h"

/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * LOCAL FUNCTIONS
 */
static void Board_keyChangeHandler(UArg a0);
static void Board_keyCallback(PIN_Handle hPin, PIN_Id pinId);

/*******************************************************************************
 * EXTERNAL VARIABLES
 */

/*********************************************************************
 * LOCAL VARIABLES
 */

// Value of keys Pressed
static uint8_t keysPressed;

// Key debounce clock
static Clock_Struct keyChangeClock;

// Pointer to application callback
keysPressedCB_t appKeyChangeHandler = NULL;

// Memory for the GPIO module to construct a Hwi
Hwi_Struct callbackHwiKeys;

// PIN configuration structure to set all KEY pins as inputs with pullups enabled
PIN_Config keyPinsCfg[] =
{
    Board_KEY_SELECT    | PIN_GPIO_OUTPUT_DIS  | PIN_INPUT_EN  |  PIN_PULLUP,
    Board_KEY_UP        | PIN_GPIO_OUTPUT_DIS  | PIN_INPUT_EN  |  PIN_PULLUP,
    Board_KEY_DOWN      | PIN_GPIO_OUTPUT_DIS  | PIN_INPUT_EN  |  PIN_PULLUP,
    Board_KEY_LEFT      | PIN_GPIO_OUTPUT_DIS  | PIN_INPUT_EN  |  PIN_PULLUP,
    Board_KEY_RIGHT     | PIN_GPIO_OUTPUT_DIS  | PIN_INPUT_EN  |  PIN_PULLUP,
    PIN_TERMINATE
};

PIN_State  keyPins;
PIN_Handle hKeyPins;

/*********************************************************************
 * PUBLIC FUNCTIONS
 */
/*********************************************************************
 * @fn      Board_initKeys
 *
 * @brief   Enable interrupts for keys on GPIOs.
 *
 * @param   appKeyCB - application key pressed callback
 *
 * @return  none
 */
void Board_initKeys(keysPressedCB_t appKeyCB)
{
  // Initialize KEY pins. Enable int after callback registered
  hKeyPins = PIN_open(&keyPins, keyPinsCfg);
  PIN_registerIntCb(hKeyPins, Board_keyCallback);
  
//  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_SELECT  | PIN_IRQ_NEGEDGE);
//  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_UP      | PIN_IRQ_NEGEDGE);
//  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_DOWN    | PIN_IRQ_NEGEDGE);
//  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_LEFT    | PIN_IRQ_NEGEDGE);
//  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_RIGHT   | PIN_IRQ_NEGEDGE);

  //ÐÞ¸Ä³ÉË«ÑØÖÐ¶Ï´¥·¢  
  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_SELECT  | PIN_IRQ_BOTHEDGES);
  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_UP      | PIN_IRQ_BOTHEDGES);
  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_DOWN    | PIN_IRQ_BOTHEDGES);
  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_LEFT    | PIN_IRQ_BOTHEDGES);
  PIN_setConfig(hKeyPins, PIN_BM_IRQ, Board_KEY_RIGHT   | PIN_IRQ_BOTHEDGES);


#ifdef POWER_SAVING
  //Enable wakeup
  PIN_setConfig(hKeyPins, PINCC26XX_BM_WAKEUP, Board_KEY_SELECT | (PINCC26XX_WAKEUP_POSEDGE));
  PIN_setConfig(hKeyPins, PINCC26XX_BM_WAKEUP, Board_KEY_UP | (PINCC26XX_WAKEUP_POSEDGE));
  PIN_setConfig(hKeyPins, PINCC26XX_BM_WAKEUP, Board_KEY_DOWN | (PINCC26XX_WAKEUP_POSEDGE));
  PIN_setConfig(hKeyPins, PINCC26XX_BM_WAKEUP, Board_KEY_LEFT | (PINCC26XX_WAKEUP_POSEDGE));
  PIN_setConfig(hKeyPins, PINCC26XX_BM_WAKEUP, Board_KEY_RIGHT | (PINCC26XX_WAKEUP_POSEDGE));
#endif
  
  // Setup keycallback for keys
  Util_constructClock(&keyChangeClock, Board_keyChangeHandler,
                      KEY_DEBOUNCE_TIMEOUT, 0, false, 0);

  // Set the application callback
  appKeyChangeHandler = appKeyCB;
}

/*********************************************************************
 * @fn      Board_keyCallback
 *
 * @brief   Interrupt handler for Keys
 *
 * @param   none
 *
 * @return  none
 */
static void Board_keyCallback(PIN_Handle hPin, PIN_Id pinId)
{
  keysPressed = 0;

  if ( PIN_getInputValue(Board_KEY_SELECT) == 0 )
  {
    keysPressed |= KEY_SELECT;
  }

  if ( PIN_getInputValue(Board_KEY_UP) == 0 )
  {
    keysPressed |= KEY_UP;
  }

  if ( PIN_getInputValue(Board_KEY_DOWN) == 0 )
  {
    keysPressed |= KEY_DOWN;
  }

  if ( PIN_getInputValue(Board_KEY_LEFT) == 0 )
  {
    keysPressed |= KEY_LEFT;
  }

  if ( PIN_getInputValue(Board_KEY_RIGHT) == 0 )
  {
    keysPressed |= KEY_RIGHT;
  }

  Util_startClock(&keyChangeClock);
}

/*********************************************************************
 * @fn      Board_keyChangeHandler
 *
 * @brief   Handler for key change
 *
 * @param   UArg a0 - ignored
 *
 * @return  none
 */
static void Board_keyChangeHandler(UArg a0)
{
  if (appKeyChangeHandler != NULL)
  {
    // Notify the application
    (*appKeyChangeHandler)(keysPressed);
  }
}
/*********************************************************************
*********************************************************************/
