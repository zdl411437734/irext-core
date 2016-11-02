#!/usr/bin/env python
# coding = utf-8

import sys
import xml.dom.minidom
import struct

keymap_dict = ("POWER", "COLOR_1", "COLOR_2", "COLOR_3", "COLOR_4", "COLOR_0", "BRIGHT", "DARK", "POWER_ON", "RAINBOW",
               "POWER_OFF", "BACK", "HOME", "MENU", "SWITCH")


class CKeyMap:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def printf(self):
        print self.name, self.value

    def packkey(self, file):
        for i in range(len(self.value)):
            file.write(struct.pack('B', self.value[i]))

    def packnull(self, file):
        for i in range(len(self.value)):
            file.write(struct.pack('B', 0))

    def packlen(self, file):
        file.write(struct.pack('B', len(self.value)))
        print len(self.value)


def print_remote(file, realPath, realName):
    print file
    dom = xml.dom.minidom.parse(file)
    root = dom.documentElement
    protocol_node = root.getElementsByTagName('protocol')
    protocol = protocol_node[0].firstChild.data

    filename = realName.split('.')

    binary = open(realPath+"/"+protocol+"#"+filename[0]+".bin", 'wb')
    bytes = struct.pack('4s', 'ykir')
    binary.write(bytes)

    print protocol
    keymap = root.getElementsByTagName('key-map')
    key = []
    empty_value = []
    for i in keymap[0].childNodes:
        if i.nodeType == i.ELEMENT_NODE:
            key_map_str = i.firstChild.data.encode('ascii').split(' ')
            value = []
            empty_value = []
            for m in range(len(key_map_str)):
                value.append(int(key_map_str[m], 16))
            empty_value.append(int('0', 16))
            name = i.getAttribute('name').encode('ascii')
            data = CKeyMap(name, value)
            key.append(data)

    key[0].packlen(binary)
    for j in range(len(keymap_dict)):
        empty_key = CKeyMap(keymap_dict[j], empty_value)
        find = 0
        for n in range(len(key)):
            if cmp(keymap_dict[j], key[n].name) == 0:
                key[n].printf()
                key[n].packkey(binary)
                find = 1
                break
        if find == 0:
            print "Don't file this key %s" % (keymap_dict[j])
            empty_key.packkey(binary)

fileName = sys.argv[1]
realName = sys.argv[2]
realPath = sys.argv[3]
fileType = fileName.split('.')
if cmp(fileType[1], "xml") == 0:
    print_remote(fileName, realPath, realName)
