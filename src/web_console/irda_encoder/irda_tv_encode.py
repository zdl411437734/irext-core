#!/usr/bin/env python
# coding = utf-8
#
# created by strawmanbobi 2016-11-10

import sys
import xml.dom.minidom
import struct

keymap_dict_ac = ()

keymap_dict_tv = ("POWER", "MUTE", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "BACK", "INPUT", "MENU", "HOME",
                  "SET", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9")

keymap_dict_stb = ("POWER", "MUTE", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "BACK", "INPUT", "MENU",
                   "UP_PAGE", "DOWN_PAGE", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9")

keymap_dict_nw = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "BACK", "MENU", "HOME", "0", "1", "2",
                  "3", "4", "5", "6", "7", "8", "9")

keymap_dict_iptv = ("POWER", "MUTE", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "BACK", "INPUT", "MENU",
                    "UP_PAGE", "DOWN_PAGE", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9")

keymap_dict_dvd = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "PLAY", "PAUSE", "EJECT", "BACK",
                   "FOR", "MENU", "SWITCH")

keymap_dict_fan = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "SPEED+", "SPEED-", "SWING", "SPEED", "MODE", "BACK",
                   "HOME", "MENU", "SWITCH")

keymap_dict_stereo = ("POWER1", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "MUTE", "MENU1", "POWER2", "BACK",
                      "HOME", "MENU2", "SWITCH")

keymap_dict_projector = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "OK", "VOL+", "VOL-", "ZOOM+", "MENU1", "ZOOM-",
                         "BACK", "HOME", "MENU2", "SWITCH")

keymap_dict_light = ("POWER", "COLOR_1", "COLOR_2", "COLOR_3", "COLOR_4", "COLOR_0", "BRIGHT", "DARK", "POWER_ON",
                     "RAINBOW", "POWER_OFF", "BACK", "HOME", "MENU", "SWITCH")

keymap_dict_clean_robot = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "START", "PLUS", "MINUS", "AUTO", "SPOT", "SPEED",
                           "TIMING", "CHARGE", "PLAN", "SWITCH")

keymap_dict_air_cleaner = ("POWER", "UP", "DOWN", "LEFT", "RIGHT", "ION", "PLUS", "MINUS", "AUTO", "SPEED", "MODE",
                           "TIMING", "LIGHT", "FORCE", "SWITCH")

keymap_dicts = [keymap_dict_ac, keymap_dict_tv, keymap_dict_stb, keymap_dict_nw, keymap_dict_iptv, keymap_dict_dvd,
                keymap_dict_fan, keymap_dict_stereo, keymap_dict_projector, keymap_dict_light, keymap_dict_clean_robot,
                keymap_dict_ac]

class CKeyMap:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def print_info(self):
        print self.name, self.value

    def pack_key(self, output_file):
        for i in range(len(self.value)):
            output_file.write(struct.pack('B', self.value[i]))

    def pack_null(self, output_file):
        for i in range(len(self.value)):
            output_file.write(struct.pack('B', 0))

    def pack_length(self, output_file):
        output_file.write(struct.pack('B', len(self.value)))
        print len(self.value)


def print_remote(input_file, real_path, real_name, category):
    print input_file
    dom = xml.dom.minidom.parse(input_file)
    root = dom.documentElement
    protocol_node = root.getElementsByTagName('protocol')
    protocol = protocol_node[0].firstChild.data

    filename = real_name.split('.')

    binary = open(real_path + "/" + protocol + "#" + filename[0] + ".bin", 'wb')
    tag = struct.pack('4s', 'irda')
    binary.write(tag)

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

    key[0].pack_length(binary)
    for j in range(len(keymap_dicts[int(category)])):
        empty_key = CKeyMap(keymap_dicts[int(category)][j], empty_value)
        find = 0
        for n in range(len(key)):
            if cmp(keymap_dicts[int(category)][j], key[n].name) == 0:
                key[n].print_info()
                key[n].pack_key(binary)
                find = 1
                break
        if find == 0:
            print "Don't file this key %s" % (keymap_dicts[int(category)][j])
            empty_key.pack_key(binary)

fileName = sys.argv[1]
realName = sys.argv[2]
realPath = sys.argv[3]
inCategory = sys.argv[4]
fileType = fileName.split('.')
if cmp(fileType[1], "xml") == 0:
    print_remote(fileName, realPath, realName, inCategory)
