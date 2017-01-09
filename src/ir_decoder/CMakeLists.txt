cmake_minimum_required(VERSION 3.2)

########################################################
project(irda_decoder)
# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
add_definitions(-DBOARD_PC)
set(SOURCE_FILES_EXECUTABLE
        include/ir_defs.h
        src/ir_utils.c
        include/ir_utils.h
        src/ir_tv_control.c
        include/ir_tv_control.h
        src/ir_ac_apply.c
        include/ir_ac_apply.h
        src/ir_ac_build_frame.c
        include/ir_ac_build_frame.h
        src/ir_ac_parse_parameter.c
        include/ir_ac_parse_parameter.h
        src/ir_ac_parse_forbidden_info.c
        include/ir_ac_parse_forbidden_info.h
        src/ir_ac_parse_frame_info.c
        include/ir_ac_parse_frame_info.h
        src/ir_ac_control.c
        include/ir_ac_control.h
        src/ir_ac_binary_parse.c
        include/ir_ac_binary_parse.h
        src/ir_decode.c
        include/ir_decode.h
        src/ir_test_main.c)

set(SOURCE_FILES_SHARED_LIB
        include/ir_defs.h
        src/ir_utils.c
        include/ir_utils.h
        src/ir_tv_control.c
        include/ir_tv_control.h
        src/ir_ac_apply.c
        include/ir_ac_apply.h
        src/ir_ac_build_frame.c
        include/ir_ac_build_frame.h
        src/ir_ac_parse_parameter.c
        include/ir_ac_parse_parameter.h
        src/ir_ac_parse_forbidden_info.c
        include/ir_ac_parse_forbidden_info.h
        src/ir_ac_parse_frame_info.c
        include/ir_ac_parse_frame_info.h
        src/ir_ac_control.c
        include/ir_ac_control.h
        src/ir_ac_binary_parse.c
        include/ir_ac_binary_parse.h
        src/ir_decode.c
        include/ir_decode.h)

add_executable(irda_decoder ${SOURCE_FILES_EXECUTABLE})
# add_library(irda_decoder SHARED ${SOURCE_FILES_SHARED_LIB})
