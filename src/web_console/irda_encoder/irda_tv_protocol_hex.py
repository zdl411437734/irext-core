#!/usr/bin/env python
# coding=utf-8
#
# created by strawmanbobi 2016-11-10

import struct
import sys
import xml.dom.minidom

flag_tab = ("boot", "stop", "separator", "one", "zero", "flip", "two", "three", "four", "five", "six", "seven",
            "eight", "nine", "A", "B", "C", "D", "E", "F")

class IRDAData:
    def __init__(self, bits, lsb, mode, index):
        self.bits = bits
        self.lsb = lsb
        self.mode = mode
        self.index = index

    def printf(self):
        print "%d %d %d %d" % (self.bits, self.lsb, self.mode, self.index)

    def packIRData(self):
        return struct.pack("BBBB", self.bits, self.lsb, self.mode, self.index)

class IRDAFlag:
    def __init__(self, name, mask, space):
        self.name = name
        self.mask = mask
        self.space = space

    def printf(self):
        print "%s %d %d" % (self.name, self.mask, self.space)

    def packFlag(self):
        return struct.pack("HH", self.mask, self.space)


def printProtocol(file):
    print file
    dom = xml.dom.minidom.parse(file)
    root = dom.documentElement
    freqnode = root.getElementsByTagName('frequency')
    freq = freqnode[0].firstChild.data
    inverseflag = 0

    protnode = root.getAttribute('name')

    print protnode
    protname = protnode.split('_')

    binary = open(sys.argv[2], 'wb')

    bytes = struct.pack('20s', protnode.encode("ascii"))
    binary.write(bytes)

    bit = root.getElementsByTagName('bit')
    for n in range(len(flag_tab)):
        for b in range(len(bit)):
            name = bit[b].getAttribute('name')
            cycles = bit[b].getAttribute('cycles')
            if name and cycles:
                if cmp(flag_tab[n], name) == 0:
                    bytes = struct.pack('B', int(cycles))
                    binary.write(bytes)
                    break
        if b == (len(bit) - 1):
            bytes = struct.pack('B', 0)
            binary.write(bytes)
    for m in range(len(flag_tab)):
        found = 0
        for i in range(len(bit)):
            name = bit[i].getAttribute('name')
            cycles = bit[i].getAttribute('cycles')
            if name and cycles and cmp(flag_tab[m], name) == 0:
                found = 1
                cycle = bit[i].getElementsByTagName('cycle')
                for c in range(len(cycle)):
                    normal = cycle[c].getAttribute('flag')
                    mask = cycle[c].getAttribute('mask')
                    space = cycle[c].getAttribute('space')
                    if cmp(normal, "normal") == 0:
                        inverseflag = 0
                    else:
                        inverseflag = 1
                    print "{\"%s\", \"cycle:%s\", 0x%04x, 0x%04x, 0x%02x}" % (
                        name, c, int(mask), int(space), int(cycles))
                    bytes = struct.pack('B', inverseflag)
                    binary.write(bytes)
                    bytes = struct.pack('HH', int(mask), int(space))
                    binary.write(bytes)

    frame = root.getElementsByTagName('frame')

    index = 0
    lsb = 0
    mode = 0
    flag = 0
    irda_frame = []
    flag_tab_dict = {"boot": 0, "stop": 1, "separator": 2, "one": 3, "zero": 4, "flip": 5, "two": 6, "three": 7,
                     "four": 8, "five": 9, "six": 10, "seven": 11, "eight": 12, "nine": 13,
                     "A": 14, "B": 15, "C": 16, "D": 17, "E": 18, "F": 19}
    for i in frame[0].childNodes:
        if i.nodeType == i.ELEMENT_NODE:
            index += 1
            if i.getAttribute('type'):
                print "{%d, \"%s\", 0, 0, 0}" % (index, i.getAttribute('type'))
                flag = IRDAData(1, 0, 0, flag_tab_dict[i.getAttribute('type').encode("ascii")])
                irda_frame.append(flag)
            if i.getAttribute('bits'):
                if cmp(i.getAttribute('ending'), "lsb") == 0:
                    lsb = 0
                else:
                    lsb = 1

                if cmp(i.getAttribute('mode'), "normal") == 0:
                    mode = 0
                else:
                    mode = 1

                print "{%d, \"%s\", %d, %d, %s}" % (index, i.getAttribute('bits'), \
                                                    lsb, mode, i.firstChild.data)
                flag = IRDAData(int(i.getAttribute('bits')), lsb, mode, int(i.firstChild.data))
                irda_frame.append(flag)

    binary.write(struct.pack("B", len(irda_frame)))

    for i in range(len(irda_frame)):
        irda_frame[i].printf()
        binary.write(irda_frame[i].packIRData())
    binary.close()

printProtocol(sys.argv[1])
