# !/usr/bin/env python
# coding=utf-8
# for protocol version V1.0
# 29 tags are supported
#
# created by strawmanbobi 2016-11-10

import sys
import xml.dom.minidom
import struct


alltags = [1, 2, 3, 4, 5, 6, 7,
           21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
           41, 42, 43, 44, 45, 46, 47, 48]

tags_max_size = [0 for x in range(0, len(alltags))]

# Definition of ac tag class
# (tag:value)


class ACTag:
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


class ACRemoteControl:
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


def create_binary(ac_device):
    find = 0
    offset = 0

    f_content = open(sys.argv[2] + str(ac_device.device_id) + "_tmp.bin", "wb")
    f_head = open(sys.argv[2] + "irda_new_ac_" + str(ac_device.device_id) + ".bin", "wb")
    f_head.write(struct.pack("B", 29))
    for i in range(len(alltags)):
        find = 0
        for j in range(len(ac_device.tags)):
            if alltags[i] == ac_device.tags[j].tag:
                f_content.write(ac_device.tags[j].value)

                f_head.write(struct.pack("H", offset))
                offset = offset + ac_device.tags[j].len

                # Find Max length
                if tags_max_size[i] < ac_device.tags[j].len:
                    tags_max_size[i] = ac_device.tags[j].len;
                find = 1
                break

        if find == 0:
            f_head.write(struct.pack("H", 0xffff))
    # f.write(ac_device)
    f_content.close()
    f_tmp = open(sys.argv[2] + str(ac_device.device_id) + "_tmp.bin", "rb")
    f_head.write(f_tmp.read())
    f_tmp.close()
    f_head.close()

dom = xml.dom.minidom.parse(sys.argv[1])
device = dom.documentElement
# devices = root.getElementsByTagName('remote_controller')

print "============================"
print "AC data:"
print "============================"
ac_device_arrary=[]
id = device.getElementsByTagName('id')
idnum = int(id[0].firstChild.data.encode('ascii'), 10)

g_ac_device = ACRemoteControl(idnum)
print "------------AC Device ID: %d-------------" % idnum
exts = device.getElementsByTagName('exts')
for n in range(len(exts)):
    ext = exts[n].getElementsByTagName('ext')
    for j in range(len(ext)):
        tag_index=ext[j].getElementsByTagName('tag')
        tag_index_data = int(tag_index[0].firstChild.data.encode('ascii'), 10)
        tag_value=ext[j].getElementsByTagName('value')
        tag_value_data = tag_value[0].firstChild.data.encode('ascii')
        g_ac_device.add(ACTag(tag_index_data, tag_value_data))
g_ac_device.sort()
g_ac_device.printf()
create_binary(g_ac_device)
ac_device_arrary.append(g_ac_device)
