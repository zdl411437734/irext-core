LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_CFLAGS    := -DBOARD_ANDROID
LOCAL_MODULE    := libirdecode
LOCAL_SRC_FILES := irda_decode_jni.c \
                   irda_decode.c \
                   irda_tv_parse.c \
                   irda_apply.c \
                   irda_irframe.c \
                   irda_parse_ac_parameter.c \
                   irda_parse_forbidden_info.c \
                   irda_parse_frame_parameter.c \
                   irda_utils.c \

LOCAL_LDLIBS += -L$(SYSROOT)/usr/lib -llog

include $(BUILD_SHARED_LIBRARY)