#!/usr/bin/env python
# coding = utf-8
# for protocol version V1.0
# 20 tags are supported

import sys
import xml.dom.minidom
import struct

allTags = [100, 101, 102, 103, 200, 201, 202, 203, 204, 205,
           206, 207, 208, 209, 210, 211, 212, 213, 214, 300]
tags_max_size = [0 for x in range(0, len(allTags))]

# Definition of BLE Central tag class
# (tag:value)


class BCTag:
    def __init__(self, tag, value):
        self.tag = tag
        self.value = value
        self.len = len(self.value)

    def __lt__(self, other):
        return self.tag < other.tag

    def printf(self):
        print "[%d] %s len:%d" % (self.tag, self.value, len(self.value))

# Definition of Remote_control class
# device id:(tag:value)...(tag:value)


class BCRemoteControl:
    def __init__(self, device_id):
        self.device_id = device_id
        self.tags = []

    def add(self, tag):
        self.tags.append(tag)

    def sort(self):
        self.tags.sort()

    def printf(self):
        print "==========Device id:%d===========" % self.device_id
        for j in range(len(self.tags)):
            self.tags[j].printf()


def create_binary(bc_device):
    find = 0
    offset = 0

    f_content = open(sys.argv[2] + str(bc_device.device_id) + "_tmp.bin", "wb")
    f_head = open(sys.argv[2] + "ykir_bc_" + str(bc_device.device_id) + ".bin", "wb")
    f_head.write(struct.pack("B", 20))
    for i in range(len(allTags)):
        find = 0
        for j in range(len(bc_device.tags)):
            if allTags[i] == bc_device.tags[j].tag:
                f_content.write(bc_device.tags[j].value)

                f_head.write(struct.pack("H", offset))
                offset = offset + bc_device.tags[j].len
###############################################################################
# Find Max length
###############################################################################
                if tags_max_size[i] < bc_device.tags[j].len:
                    tags_max_size[i] = bc_device.tags[j].len
                find = 1
                break

        if find == 0:
            f_head.write(struct.pack("H", 0xffff))

    f_content.close()
    f_tmp = open(sys.argv[2] + str(bc_device.device_id) + "_tmp.bin", "rb")
    f_head.write(f_tmp.read())
    f_tmp.close()
    f_head.close()

dom = xml.dom.minidom.parse(sys.argv[1])
device = dom.documentElement
# devices = root.getElementsByTagName('remote_controller')

print "============================"
print "BC data:"
print "============================"
bc_device_array=[]
id = device.getElementsByTagName('id')
idnum = int(id[0].firstChild.data.encode('ascii'), 10)

g_bc_device = BCRemoteControl(idnum)
print "------------BC Device ID: %d-------------" % idnum
exts = device.getElementsByTagName('exts')
for n in range(len(exts)):
    ext = exts[n].getElementsByTagName('ext')
    for j in range(len(ext)):
        tag_index=ext[j].getElementsByTagName('tag')
        tag_index_data = int(tag_index[0].firstChild.data.encode('ascii'), 10)
        tag_value=ext[j].getElementsByTagName('value')
        tag_value_data = tag_value[0].firstChild.data.encode('ascii')
        g_bc_device.add(BCTag(tag_index_data, tag_value_data))
g_bc_device.sort()
g_bc_device.printf()
create_binary(g_bc_device)
bc_device_array.append(g_bc_device)
