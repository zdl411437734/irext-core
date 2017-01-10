
#ifndef BOARD_LED_H
#define BOARD_LED_H

#ifdef __cplusplus
extern "C" {
#endif

/* LEDS - The LED number is the same as the bit position */
#define HAL_LED_1     0x01
#define HAL_LED_2     0x02
#define HAL_LED_3     0x04
#define HAL_LED_4     0x08
#define HAL_LED_ALL   (HAL_LED_1 | HAL_LED_2 | HAL_LED_3 | HAL_LED_4)

/* Modes */
#define HAL_LED_MODE_OFF     0x00
#define HAL_LED_MODE_ON      0x01
//#define HAL_LED_MODE_BLINK   0x02
#define HAL_LED_MODE_FLASH   0x04
#define HAL_LED_MODE_TOGGLE  0x08

/* Defaults */
//#define HAL_LED_DEFAULT_MAX_LEDS      4
//#define HAL_LED_DEFAULT_DUTY_CYCLE    5
//#define HAL_LED_DEFAULT_FLASH_COUNT   50
//#define HAL_LED_DEFAULT_FLASH_TIME    1000


extern void HalLedInit( void );

extern uint8 HalLedSet( uint8 led, uint8 mode );


#ifdef __cplusplus
}
#endif

#endif /* BOARD_LED_H */
