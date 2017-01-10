
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

/*
阿莫单片机科技淘宝店鼎力编码
https://amomcu.taobao.com/
您的蓝牙开发需求就是我们努力的方向-----2015.09.09
*/

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
  //PIN_registerIntCb(hKeyPins, Board_keyCallback);
  
//  PIN_setConfig(hledPins, PIN_BM_IRQ, Board_LED1  | PIN_IRQ_DIS);
//  PIN_setConfig(hledPins, PIN_BM_IRQ, Board_LED2  | PIN_IRQ_DIS);
//  PIN_setConfig(hledPins, PIN_BM_IRQ, Board_LED3  | PIN_IRQ_DIS);
//  PIN_setConfig(hledPins, PIN_BM_IRQ, Board_LED4  | PIN_IRQ_DIS);

#ifdef POWER_SAVING
  //Enable wakeup
#endif
  
  // Setup keycallback for keys
//  Util_constructClock(&keyChangeClock, Board_keyChangeHandler,
//                      KEY_DEBOUNCE_TIMEOUT, 0, false, 0);

//  // Set the application callback
//  appKeyChangeHandler = appKeyCB;
}

void HalLedInit( void )
{
//    GPIODirModeSet(Board_LED1, GPIO_DIR_MODE_OUT);
//    GPIODirModeSet(Board_LED2, GPIO_DIR_MODE_OUT);
//    GPIODirModeSet(Board_LED3, GPIO_DIR_MODE_OUT);
//    GPIODirModeSet(Board_LED4, GPIO_DIR_MODE_OUT);

//    GPIOPinWrite(Board_LED1, 0);
//    GPIOPinWrite(Board_LED2, 0);
//    GPIOPinWrite(Board_LED3, 0);
//    GPIOPinWrite(Board_LED4, 0);
  if(NULL == hledPins)
  {
    Board_initLeds();
  }
}


/*
uint8 led:
#define HAL_LED_1     0x01
#define HAL_LED_2     0x02
#define HAL_LED_3     0x04
#define HAL_LED_4     0x08
#define HAL_LED_ALL   (HAL_LED_1 | HAL_LED_2 | HAL_LED_3 | HAL_LED_4)

uint8 mode:
#define HAL_LED_MODE_OFF     0x00
#define HAL_LED_MODE_ON      0x01
#define HAL_LED_MODE_TOGGLE  0x08
*/ 
uint8 HalLedSet( uint8 led, uint8 mode )
{
//    uint8 i = 0;
//    uint8 pin[4] = {Board_LED1, Board_LED2, Board_LED3, Board_LED4};    

//    for(i= 0; i<=3; i++)
//    {      
//         uint8 k = (0x1<<i);
//        if(led & (0x1<<i))
//        {
//            switch(mode)
//            {
//            case HAL_LED_MODE_OFF:
//                GPIOPinWrite(pin[i], 0);
//                break;
//            case HAL_LED_MODE_ON:
//                GPIOPinWrite(pin[i], 1);
//                break;
//            case HAL_LED_MODE_TOGGLE:
//                GPIOPinToggle(pin[i]);
//                
//                break;
//            }
//        }
//    }


    uint8 i = 0;
    uint8 pin[4] = {Board_LED1, Board_LED2, Board_LED3, Board_LED4};    

    if(NULL == hledPins)
    {
        Board_initLeds();
    }

    for(i= 0; i<=3; i++)
    {      
        //uint8 k = (0x1<<i);
        if(led & (0x1<<i))
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
                PIN_setOutputValue(hledPins, pin[i],  !PIN_getOutputValue( pin[i]));                
                break;
            }
        }
    }

//    static uint8 pin_state = 1;
//    if(pin_state == 0) pin_state = 1;
//    else pin_state = 0;
//    
//    uint_t pin_state = PIN_getOutputValue(Board_LED1);

//    PIN_setOutputValue(hledPins, Board_LED3, pin_state);

     return 0;
}






