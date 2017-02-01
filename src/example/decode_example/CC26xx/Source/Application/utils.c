/**************************************************************************************
Filename:       utils.c
Revised:        Date: 2017-02-01
Revision:       Revision: 1.0

Description:    This file contains utilities for irext sample on CC26XX

Revision log:
* 2017-02-01: created by strawmanbobi
**************************************************************************************/

#include <string.h>
#include <stdlib.h>

#include "utils.h"


static void _itoa(unsigned int uiNum, unsigned char *buf, unsigned char uiRadix);


static void _itoa(unsigned int uiNum, unsigned char *buf, unsigned char uiRadix)
{
    unsigned char c, i;
    unsigned char *p, rst[32];

    p = rst;
    for (i = 0; i < 32; i++, p++)
    {
        /* Isolate a digit */
        c = uiNum % uiRadix;
        /* Convert to Ascii */
        *p = c + ((c < 10) ? '0' : '7');
        uiNum /= uiRadix;
        if (!uiNum)
            break;
    }

    for (c = 0; c <= i; c++)
    {
        /* Reverse character order */
        *buf++ = *p--;
    }
    *buf = '\0';
}


unsigned char * _ltoa(unsigned long l, unsigned char *buf, unsigned char radix)
{
#if defined (__TI_COMPILER_VERSION)
  return ( (unsigned char*)ltoa( l, (char *)buf ) );
#elif defined( __GNUC__ )
  return ( (char*)ltoa( l, buf, radix ) );
#else
  unsigned char tmp1[10] = "", tmp2[10] = "", tmp3[10] = "";
  unsigned short num1, num2, num3;
  unsigned char i;

  buf[0] = '\0';

  if ( radix == 10 )
  {
    num1 = l % 10000;
    num2 = (l / 10000) % 10000;
    num3 = (unsigned short)(l / 100000000);

    if (num3) _itoa(num3, tmp3, 10);
    if (num2) _itoa(num2, tmp2, 10);
    if (num1) _itoa(num1, tmp1, 10);

    if (num3)
    {
      strcpy((char*)buf, (char const*)tmp3);
      for (i = 0; i < 4 - strlen((char const*)tmp2); i++)
        strcat((char*)buf, "0");
    }
    strcat((char*)buf, (char const*)tmp2);
    if (num3 || num2)
    {
      for (i = 0; i < 4 - strlen((char const*)tmp1); i++)
        strcat((char*)buf, "0");
    }
    strcat((char*)buf, (char const*)tmp1);
    if (!num3 && !num2 && !num1)
      strcpy((char*)buf, "0");
  }
  else if ( radix == 16 )
  {
    num1 = l & 0x0000FFFF;
    num2 = l >> 16;

    if (num2) _itoa(num2, tmp2, 16);
    if (num1) _itoa(num1, tmp1, 16);

    if (num2)
    {
      strcpy((char*)buf,(char const*)tmp2);
      for (i = 0; i < 4 - strlen((char const*)tmp1); i++)
        strcat((char*)buf, "0");
    }
    strcat((char*)buf, (char const*)tmp1);
    if (!num2 && !num1)
      strcpy((char*)buf, "0");
  }
  else
    return NULL;

  return buf;
#endif
}

