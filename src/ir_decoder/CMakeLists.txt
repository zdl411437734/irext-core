cmake_minimum_required(VERSION 3.2)
project(irda_decoder)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
add_definitions(-DBOARD_PC)
set(SOURCE_FILES
        irda_decode.c
        irda_decode.h
        irda_lib.c
        irda_lib.h
        irda_apply.c
        irda_apply.h
        irda_defs.h
        irda_irframe.c
        irda_irframe.h
        irda_parse_ac_parameter.c
        irda_parse_ac_parameter.h
        irda_parse_forbidden_info.c
        irda_parse_forbidden_info.h
        irda_parse_frame_parameter.c
        irda_parse_frame_parameter.h
        irda_utils.c
        irda_utils.h)

add_executable(irda_decoder ${SOURCE_FILES})