cmake_minimum_required(VERSION 3.6)
project(ir_reverser)

set(CMAKE_C_STANDARD 99)

set(SOURCE_FILES src/ire_test_main.c
    include/ire_tv_protocol_def.h)
add_executable(ir_reverser ${SOURCE_FILES})