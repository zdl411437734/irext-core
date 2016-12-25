cmake_minimum_required(VERSION 3.2)

########################################################
project(irda_decoder)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
add_definitions(-DBOARD_PC)
set(SOURCE_FILES_EXECUTABLE
        irda_decode.c
        include/irda_decode.h
        irda_tv_parse_protocol.c
        include/irda_tv_parse_protocol.h
        irda_ac_apply.c
        include/irda_ac_apply.h
        include/irda_defs.h
        irda_ac_build_frame.c
        include/irda_ac_build_frame.h
        irda_ac_parse_parameter.c
        include/irda_ac_parse_parameter.h
        irda_ac_parse_forbidden_info.c
        include/irda_ac_parse_forbidden_info.h
        irda_ac_parse_frame_info.c
        include/irda_ac_parse_frame_info.h
        irda_utils.c
        include/irda_utils.h
        irda_main.c
        )

set(SOURCE_FILES_SHARED_LIB
        irda_decode.c
        include/irda_decode.h
        irda_tv_parse_protocol.c
        include/irda_tv_parse_protocol.h
        irda_ac_apply.c
        include/irda_ac_apply.h
        include/irda_defs.h
        irda_ac_build_frame.c
        include/irda_ac_build_frame.h
        irda_ac_parse_parameter.c
        include/irda_ac_parse_parameter.h
        irda_ac_parse_forbidden_info.c
        include/irda_ac_parse_forbidden_info.h
        irda_ac_parse_frame_info.c
        include/irda_ac_parse_frame_info.h
        irda_utils.c
        include/irda_utils.h)

add_executable(irda_decoder ${SOURCE_FILES_EXECUTABLE})
# add_library(irda_decoder SHARED ${SOURCE_FILES_SHARED_LIB})
