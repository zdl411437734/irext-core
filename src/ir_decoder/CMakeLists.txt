cmake_minimum_required(VERSION 3.2)

########################################################
project(irda_decoder)
# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
add_definitions(-DBOARD_PC)
# add_definitions(-DBOARD_PC -DBOARD_PC_JNI)

IF (CMAKE_SYSTEM_NAME MATCHES "Linux")
    MESSAGE("compile platform : Linux")
    add_definitions(-DPLATFORM_LINUX)
ELSEIF (CMAKE_SYSTEM_NAME MATCHES "Windows")
    MESSAGE("compile platform : win32")
    add_definitions(-DPLATFORM_WIN32)
ELSE ()
    MESSAGE("invalid compile platform")
    add_definitions(-DPLATFORM_WIN32)
ENDIF ()

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

set(SOURCE_FILES_JNI_SHARED_LIB
        jni/ir_decode_jni.h
        jni/ir_decode_jni.c
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
# add_library(irda_decoder SHARED ${SOURCE_FILES_JNI_SHARED_LIB})
