#!/usr/bin/env python
# coding=utf-8

import sys
import os

for root, dirs, files in os.walk(sys.argv[1]):
    for i in files:
        fileType = i.split('.')
        if cmp(fileType[1], 'bin') == 0:
            print root + i

            print "========================list==========================="

            remotePath = sys.argv[2]
            fileType2 = remotePath.split('.')
            if cmp(fileType2[-1], 'bin') == 0:
                prottype = fileType2[0].split('#')
                print(prottype[0])
                print(fileType[0])
                if cmp(prottype[0].split('/')[-1], fileType[0]) == 0:
                    outname = remotePath.split('#')
                    binary = open(sys.argv[3] + "/ykir_"+outname[0].split('/')[-1]+"_"+outname[1], 'wb')
                    prot_file = open(root+i, "rb")
                    remote_file = open(remotePath, "rb")
                    binary.write(prot_file.read())
                    binary.write(remote_file.read())
                    binary.close()
                    prot_file.close()
                    remote_file.close()
                    print remotePath
            print
            print
