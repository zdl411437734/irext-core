
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
//#include <ti/drivers/i2c/I2CCC26XX.h>
//#include <ti/drivers/I2C.h>

#include "board_uart.h"
#include "board_LCD.h"
//#include <ti/drivers/lcd/LCDDogm1286.h>
#include "../../npi/inc/npi_tl_uart.h"


#ifdef NPI_USE_UART


static char tRxBuf[256];
static char tTxBuf[256];

static bool uartInitFlag = FALSE;




void Uart_Init(npiCB_t npiCBack)
{
    if(!uartInitFlag)
    {
        NPITLUART_initializeTransport(tRxBuf, tTxBuf, npiCBack);
        uartInitFlag = TRUE;

        sprintf(tTxBuf, "NPITLUART_initialize");
        NPITLUART_writeTransport(strlen(tTxBuf));
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


#endif


