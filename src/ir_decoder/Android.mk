LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_CFLAGS    := -DBOARD_ANDROID
LOCAL_MODULE    := libirdecode
LOCAL_SRC_FILES := ./jni/ir_decode_jni.c \
                   ./src/ir_decode.c \
                   ./src/ir_tv_control.c \
                   ./src/ir_ac_apply.c \
                   ./src/ir_ac_build_frame.c \
                   ./src/ir_ac_parse_parameter.c \
                   ./src/ir_ac_parse_forbidden_info.c \
                   ./src/ir_ac_parse_frame_info.c \
				   ./src/ir_ac_binary_parse.c \
				   ./src/ir_ac_control.c \
                   ./src/ir_utils.c \

LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib -llog

include $(BUILD_SHARED_LIBRARY)