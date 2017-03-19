#include "stdafx.h"
#include "DecodeTestWin.h"
#include "irda_decode.h"

using namespace std;

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// global variable definition
long binary_length = 0;
UINT8 *binary_content = NULL;

CWinApp theApp;
HINSTANCE hInDecodeDll = NULL;

remote_ac_status_t ac_status;
UINT16 user_data[USER_DATA_SIZE] = { 0 };

typedef INT8(*lp_irda_ac_file_open) (char* file_name);
typedef INT8(*lp_irda_ac_lib_open) (UINT8 *binary, UINT16 binary_length);
typedef INT8(*lp_irda_ac_lib_close) (void);
typedef INT8(*lp_irda_ac_lib_parse) (void);
typedef UINT16(*lp_irda_ac_lib_control) (remote_ac_status_t ac_status, UINT16 *user_data, UINT8 function_code, BOOL change_wind_direction);

typedef INT8(*lp_get_temperature_range) (UINT8 ac_mode, INT8* temp_min, INT8* temp_max);
typedef INT8(*lp_get_supported_mode) (UINT8* supported_mode);
typedef INT8(*lp_get_supported_wind_speed) (UINT8 ac_mode, UINT8* supported_wind_speed);
typedef INT8(*lp_get_supported_swing) (UINT8 ac_mode, UINT8* supported_swing);
typedef INT8(*lp_get_supported_wind_direction) (UINT8* supported_wind_direction);

typedef INT8(*lp_irda_tv_file_open) (char* file_name);
typedef INT8(*lp_irda_tv_lib_open) (UINT8 *binary, UINT16 binary_length);
typedef INT8(*lp_irda_tv_lib_parse) (UINT8 irda_hex_encode);
typedef UINT16(*lp_irda_tv_lib_control) (UINT8 key_code, UINT16* user_data);
typedef INT8(*lp_irda_tv_lib_close) (void);


lp_irda_ac_file_open IRDAACFileOpen;
lp_irda_ac_lib_open IRDAACLibOpen;
lp_irda_ac_lib_parse IRDAACLibParse;
lp_irda_ac_lib_control IRDAACLibControl;
lp_irda_ac_lib_close IRDAACLibClose;

lp_get_supported_mode GetSupportedMode;
lp_get_supported_swing GetSupportedSwing;
lp_get_supported_wind_speed GetSupportedWindSpeed;
lp_get_supported_wind_direction GetSupportedWindDirection;
lp_get_temperature_range GetTemperatureRange;

lp_irda_tv_file_open IRDATVFileOpen;
lp_irda_tv_lib_open IRDATVLibOpen;
lp_irda_tv_lib_parse IRDATVLibParse;
lp_irda_tv_lib_control IRDATVLibControl;
lp_irda_tv_lib_close IRDATVLibClose;


INT8 decode_as_ac(char* file_name)
{
	// keyboard input
	int in_char = 0;
	int count = 0;
	BOOL op_match = TRUE;
	UINT8 function_code = AC_FUNCTION_MAX;

	// get status
	UINT8 supported_mode = 0x00;
	INT8 min_temperature = 0;
	INT8 max_temperature = 0;
	UINT8 supported_speed = 0x00;
	UINT8 supported_swing = 0x00;

	BOOL need_control = TRUE;

	// init air conditioner status
	ac_status.acDisplay = 0;
	ac_status.acSleep = 0;
	ac_status.acTimer = 0;
	ac_status.acPower = AC_POWER_OFF;
	ac_status.acMode = AC_MODE_COOL;
	ac_status.acTemp = AC_TEMP_20;
	ac_status.acWindDir = AC_SWING_ON;
	ac_status.acWindSpeed = AC_WS_AUTO;

	if (IR_DECODE_FAILED == IRDAACFileOpen(file_name))
	{
		IRDAACLibClose();
		return IR_DECODE_FAILED;
	}

	if (IR_DECODE_FAILED == IRDAACLibParse())
	{
		IR_PRINTF("ac lib parse failed\n");
		IRDAACLibClose();
		return IR_DECODE_FAILED;
	}
	do
	{
		in_char = getchar();
		op_match = TRUE;
		need_control = TRUE;
		switch (in_char)
		{
		case 'w':
		case 'W':
			// temperature plus
			ac_status.acTemp = (ac_status.acTemp == AC_TEMP_30) ? AC_TEMP_30 : (ac_status.acTemp + 1);
			function_code = AC_FUNCTION_TEMPERATURE_UP;
			break;
		case 's':
		case 'S':
			ac_status.acTemp = (ac_status.acTemp == AC_TEMP_16) ? AC_TEMP_16 : (ac_status.acTemp - 1);
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
			ac_status.acWindDir = (ac_status.acWindDir == 0) ? 1 : 0;
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
			if (IR_DECODE_SUCCEEDED == GetSupportedMode(&supported_mode))
			{
				IR_PRINTF("supported mode = %02X\n", supported_mode);
			}
			need_control = FALSE;
			break;

		case '4':
			if (IR_DECODE_SUCCEEDED == GetSupportedSwing(ac_status.acMode, &supported_swing))
			{
				IR_PRINTF("supported swing in %d = %02X\n", ac_status.acMode, supported_swing);
			}
			need_control = FALSE;
			break;
		case '5':
			if (IR_DECODE_SUCCEEDED == GetSupportedWindSpeed(ac_status.acMode, &supported_speed))
			{
				IR_PRINTF("supported wind speed in %d = %02X\n", ac_status.acMode, supported_speed);
			}
			need_control = FALSE;
			break;

		case '6':
			if (IR_DECODE_SUCCEEDED == GetTemperatureRange(ac_status.acMode, &min_temperature, &max_temperature))
			{
				IR_PRINTF("supported temperature range in mode %d = %d, %d\n",
					ac_status.acMode, min_temperature, max_temperature);
			}
			need_control = FALSE;
			break;

		default:
			op_match = FALSE;
			break;
		}

		if (TRUE == op_match && TRUE == need_control)
		{
			IR_PRINTF("switch AC to power = %d, mode = %d, temp = %d, speed = %d, swing = %d\n",
				ac_status.acPower,
				ac_status.acMode,
				ac_status.acTemp,
				ac_status.acWindSpeed,
				ac_status.acWindDir
				);
			IRDAACLibControl(ac_status, user_data, function_code, TRUE);
		}
	} while ('0' != in_char);

	IRDAACLibClose();

	// free binary buffer
	irda_free(binary_content);
	binary_length = 0;

	return IR_DECODE_SUCCEEDED;
}

INT8 decode_as_tv(char *file_name, UINT8 irda_hex_encode)
{
	// keyboard input
	int in_char = 0;
	int key_code = -1;
	int count = 0;

	if (IR_DECODE_FAILED == IRDATVFileOpen(file_name))
	{
		return IR_DECODE_FAILED;
	}

	if (IR_DECODE_FAILED == IRDATVLibParse(irda_hex_encode))
	{
		return IR_DECODE_FAILED;
	}
	do
	{
		in_char = getchar();
		if (in_char >= '0' && in_char <= '9')
		{
			key_code = in_char - '0';
			IRDATVLibControl(key_code, user_data);
		}
		else if (in_char >= 'a' && in_char <= 'f')
		{
			key_code = 10 + (in_char - 'a');
			IRDATVLibControl(key_code, user_data);
		}
		else if (in_char == 'q')
		{
			IRDATVLibClose();
		}
		else
		{
			// do nothing
		}
	} while ('Q' != in_char);

	// free binary buffer
	irda_free(binary_content);
	binary_length = 0;

	return IR_DECODE_SUCCEEDED;
}

int main(int argc, char *argv[])
{
	int nRetCode = 0;

	HMODULE hModule = ::GetModuleHandle(nullptr);

	if (hModule != nullptr)
	{
		if (!AfxWinInit(hModule, nullptr, ::GetCommandLine(), 0))
		{
			wprintf(L"error: MFC failed to initialize\n");
			nRetCode = 1;
		}
		else
		{
			hInDecodeDll = LoadLibrary(_T("ir_decoder.dll"));
			if (NULL != hInDecodeDll)
			{
				IR_PRINTF("load library successfully\n");
				IRDAACFileOpen = (lp_irda_ac_file_open)GetProcAddress(hInDecodeDll, "irda_ac_file_open");
				IRDAACLibOpen = (lp_irda_ac_lib_open)GetProcAddress(hInDecodeDll, "irda_ac_lib_open");
				IRDAACLibParse = (lp_irda_ac_lib_parse)GetProcAddress(hInDecodeDll, "irda_ac_lib_parse");
				IRDAACLibControl = (lp_irda_ac_lib_control)GetProcAddress(hInDecodeDll, "irda_ac_lib_control");
				IRDAACLibClose = (lp_irda_ac_lib_close)GetProcAddress(hInDecodeDll, "irda_ac_lib_close");

				GetSupportedMode = (lp_get_supported_mode)GetProcAddress(hInDecodeDll, "get_supported_mode");
				GetSupportedSwing = (lp_get_supported_swing)GetProcAddress(hInDecodeDll, "get_supported_swing");
				GetSupportedWindSpeed = (lp_get_supported_wind_speed)GetProcAddress(hInDecodeDll, "get_supported_wind_speed");
				GetSupportedWindDirection = (lp_get_supported_wind_direction)GetProcAddress(hInDecodeDll, "get_supported_wind_direction");
				GetTemperatureRange = (lp_get_temperature_range)GetProcAddress(hInDecodeDll, "get_temperature_range");

				IRDATVFileOpen = (lp_irda_tv_file_open)GetProcAddress(hInDecodeDll, "irda_tv_file_open");
				IRDATVLibOpen = (lp_irda_tv_lib_open)GetProcAddress(hInDecodeDll, "irda_tv_lib_open");
				IRDATVLibParse = (lp_irda_tv_lib_parse)GetProcAddress(hInDecodeDll, "irda_tv_lib_parse");
				IRDATVLibControl = (lp_irda_tv_lib_control)GetProcAddress(hInDecodeDll, "irda_tv_lib_control");
				IRDATVLibClose = (lp_irda_tv_lib_close)GetProcAddress(hInDecodeDll, "irda_tv_lib_close");

				char function = '0';
				UINT8 irda_hex_encode = 0;

				if (4 != argc)
				{
					IR_PRINTF("number of args error !\n");
					return -1;
				}

				function = argv[1][0];
				irda_hex_encode = (UINT8)(argv[3][0] - '0');
				IR_PRINTF("decode functionality = %c\n", function);

				switch (function)
				{
				case '0':
					IR_PRINTF("decode binary file as AC\n");
					decode_as_ac(argv[2]);
					break;

				case '1':
					IR_PRINTF("decode binary file as TV : %d\n", irda_hex_encode);
					decode_as_tv(argv[2], irda_hex_encode);
					break;

				default:
					IR_PRINTF("decode functionality error !\n");
					break;
				}

				FreeLibrary(hInDecodeDll);
			}
			else
			{
				IR_PRINTF("load library failed\n");
			}
		}
	}
	else
	{
		wprintf(L"error: GetModuleHandle failed\n");
		nRetCode = 1;
	}

	system("pause");

	return nRetCode;
}