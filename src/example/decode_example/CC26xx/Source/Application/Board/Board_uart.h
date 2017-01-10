#ifndef BOARD_UART_H
#define BOARD_UART_H

#ifdef __cplusplus
extern "C" {
#endif

#include "../../npi/inc/npi_tl_uart.h"

#define uint8    unsigned char

extern void Uart_Init(npiCB_t npiCBack);

extern void UART_WriteTransport (uint8 *str, uint8 len);

extern uint8 *UART_GetRxBufferAddress();

#ifdef __cplusplus
}
#endif

#endif
