/**************************************************************************************
Filename:       ir_main.c
Revised:        Date: 2016-11-05
Revision:       Revision: 1.0

Description:    This file provides main entry for irda decoder

Revision log:
* 2016-11-05: created by strawmanbobi
**************************************************************************************/

#include <stdio.h>

#include "../include/ir_defs.h"
#include "../include/ir_decode.h"

// global variable definition
remote_ac_status_t ac_status;
UINT16 user_data[USER_DATA_SIZE];


INT8 ir_tv_file_open(const char *file_name);


INT8 decode_as_ac(char* file_name)
{
    // keyboard input
    int in_char = 0;
    BOOL op_match;
    UINT8 function_code = AC_FUNCTION_MAX;

    // get status
    UINT8 supported_mode = 0x00;
    INT8 min_temperature = 0;
    INT8 max_temperature = 0;
    UINT8 supported_speed = 0x00;
    UINT8 supported_swing = 0x00;
    UINT8 supported_wind_direction = 0x00;

    BOOL need_control;

    // init air conditioner status
    ac_status.acDisplay = 0;
    ac_status.acSleep = 0;
    ac_status.acTimer = 0;
    ac_status.acPower = AC_POWER_OFF;
    ac_status.acMode = AC_MODE_COOL;
    ac_status.acTemp = AC_TEMP_20;
    ac_status.acWindDir = AC_SWING_ON;
    ac_status.acWindSpeed = AC_WS_AUTO;

    if (IR_DECODE_FAILED == ir_ac_file_open(file_name))
    {
        ir_ac_lib_close();
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == ir_ac_lib_parse())
    {
        ir_printf("\nac lib parse failed\n");
        ir_ac_lib_close();
        return IR_DECODE_FAILED;
    }
    do
    {
        in_char = getchar();
        op_match = TRUE;
        need_control = TRUE;
        switch(in_char)
        {
            case 'w':
            case 'W':
                // temperature plus
                ac_status.acTemp = (UINT8)((ac_status.acTemp == AC_TEMP_30) ? AC_TEMP_30 : (ac_status.acTemp + 1));
                function_code = AC_FUNCTION_TEMPERATURE_UP;
                break;
            case 's':
            case 'S':
                ac_status.acTemp = (UINT8)((ac_status.acTemp == AC_TEMP_16) ? AC_TEMP_16 : (ac_status.acTemp - 1));
                function_code = AC_FUNCTION_TEMPERATURE_DOWN;
                // temperature minus
                break;
            case 'a':
            case 'A':
                ++ac_status.acWindSpeed;
                ac_status.acWindSpeed = ac_status.acWindSpeed % AC_WS_MAX;
                function_code = AC_FUNCTION_WIND_SPEED;
                // wind speed loop
                break;
            case 'd':
            case 'D':
                ac_status.acWindDir = (UINT8)((ac_status.acWindDir == 0) ? 1 : 0);
                function_code = AC_FUNCTION_WIND_SWING;
                // wind swing loop
                break;
            case 'q':
            case 'Q':
                ++ac_status.acMode;
                ac_status.acMode = ac_status.acMode % AC_MODE_MAX;
                function_code = AC_FUNCTION_MODE;
                break;
            case '1':
                // turn on
                ac_status.acPower = AC_POWER_ON;
                function_code = AC_FUNCTION_POWER;
                break;
            case '2':
                // turn off
                ac_status.acPower = AC_POWER_OFF;
                // FUNCTION MAX refers to power off
                // function_code = AC_FUNCTION_POWER;
                break;
            case '3':
                if (IR_DECODE_SUCCEEDED == get_supported_mode(&supported_mode))
                {
                    ir_printf("\nsupported mode = %02X\n", supported_mode);
                }
                need_control = FALSE;
                break;

            case '4':
                if (IR_DECODE_SUCCEEDED == get_supported_swing(ac_status.acMode, &supported_swing))
                {
                    ir_printf("\nsupported swing in %d = %02X\n", ac_status.acMode, supported_swing);
                }
                need_control = FALSE;
                break;
            case '5':
                if (IR_DECODE_SUCCEEDED == get_supported_wind_speed(ac_status.acMode, &supported_speed))
                {
                    ir_printf("\nsupported wind speed in %d = %02X\n", ac_status.acMode, supported_speed);
                }
                need_control = FALSE;
                break;

            case '6':
                if (IR_DECODE_SUCCEEDED == get_temperature_range(ac_status.acMode, &min_temperature, &max_temperature))
                {
                    ir_printf("\nsupported temperature range in mode %d = %d, %d\n",
                              ac_status.acMode, min_temperature, max_temperature);
                }
                need_control = FALSE;
                break;

            case '7':
                if (IR_DECODE_SUCCEEDED == get_supported_wind_direction(&supported_wind_direction))
                {
                    ir_printf("\nsupported wind direction = %02X\n", supported_wind_direction);
                }
                need_control = FALSE;
                break;

            default:
                op_match = FALSE;
                break;
        }

        if(TRUE == op_match && TRUE == need_control)
        {
            ir_printf("switch AC to power = %d, mode = %d, temp = %d, speed = %d, swing = %d\n",
                      ac_status.acPower,
                      ac_status.acMode,
                      ac_status.acTemp,
                      ac_status.acWindSpeed,
                      ac_status.acWindDir
            );

            ir_ac_lib_control(ac_status, user_data, function_code, TRUE);
        }
    } while('0' != in_char);

    ir_ac_lib_close();

    return IR_DECODE_SUCCEEDED;
}

INT8 decode_as_tv(char *file_name, UINT8 ir_hex_encode)
{
    // keyboard input
    int in_char = 0;
    int key_code = 0;

    if (IR_DECODE_FAILED == ir_tv_file_open(file_name))
    {
        return IR_DECODE_FAILED;
    }

    if (IR_DECODE_FAILED == ir_tv_lib_parse(ir_hex_encode))
    {
        return IR_DECODE_FAILED;
    }
    do
    {
        in_char = getchar();
        if (in_char >= '0' && in_char <= '9')
        {
            key_code = in_char - '0';
            ir_tv_lib_control((UINT8) key_code, user_data);
        }
        else if (in_char >= 'a' && in_char <= 'f')
        {
            key_code = 10 + (in_char - 'a');
            ir_tv_lib_control((UINT8) key_code, user_data);
        }
        else if (in_char == 'q')
        {
            ir_tv_lib_close();
        }
        else
        {
            // do nothing
        }
    } while('Q' != in_char);

    return IR_DECODE_SUCCEEDED;
}

int main(int argc, char *argv[])
{
    char function = '0';
    UINT8 ir_hex_encode = 0;

    if (4 != argc)
    {
        ir_printf("number of args error !\n");
        return -1;
    }

    function = argv[1][0];
    ir_hex_encode = (UINT8)(argv[3][0] - '0');
    ir_printf("decode functionality = %c\n", function);

    switch (function)
    {
        case '0':
            ir_printf("decode binary file as AC\n");
            decode_as_ac(argv[2]);
            break;

        case '1':
            ir_printf("decode binary file as TV : %d\n", ir_hex_encode);
            decode_as_tv(argv[2], ir_hex_encode);
            break;

        default:
            ir_printf("decode functionality error !\n");
            break;
    }
}