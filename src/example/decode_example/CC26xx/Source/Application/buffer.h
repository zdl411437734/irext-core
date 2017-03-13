/**************************************************************************************
Filename:       buffer.h
Revised:        Date: 2017-01-01
Revision:       Revision: 1.0

Description:    This file provides basic buffer support for queue

Revision log:
* 2017-01-01: created by strawmanbobi
**************************************************************************************/


#ifndef BUFFER_H
#define BUFFER_H

#ifdef __cplusplus
extern "C"
{
#endif

#define SEND_BUF_MAX_SIZE   256

extern bool queue_write(uint8 *WrBuf, unsigned short WrLen);

extern unsigned short queue_read(uint8 *RdBuf, unsigned short RdLen);

extern unsigned short queue_total();

extern void queue_clear();

#ifdef __cplusplus
}
#endif

#endif
