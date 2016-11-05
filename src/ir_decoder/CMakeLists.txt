cmake_minimum_required(VERSION 3.2)
project(irda_decoder)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
add_definitions(-DBOARD_PC)
set(SOURCE_FILES
        irda_decode.c
        include/irda_decode.h
        irda_lib.c
        include/irda_lib.h
        irda_apply.c
        include/irda_apply.h
        include/irda_defs.h
        irda_irframe.c
        include/irda_irframe.h
        irda_parse_ac_parameter.c
        include/irda_parse_ac_parameter.h
        irda_parse_forbidden_info.c
        include/irda_parse_forbidden_info.h
        irda_parse_frame_parameter.c
        include/irda_parse_frame_parameter.h
        irda_utils.c
        include/irda_utils.h)

add_executable(irda_decoder ${SOURCE_FILES})