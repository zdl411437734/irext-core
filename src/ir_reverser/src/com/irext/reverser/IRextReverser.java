/*
 * Created by strawmanbobi
 * 2017-01-10
 *
 * IR reverse engineering robot for IREXT
 */

package com.irext.reverser;

import com.irext.reverser.robot.ReverseEngine;

public class IRextReverser {

    private final static int FUNCTION_REVERSE = 0;

    public static void main(String[] args) {
        try {
            int mFunction = Integer.parseInt(args[0]);

            switch(mFunction) {
                case FUNCTION_REVERSE: {
                    if (2 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like IRextReverser [function_code = 0] " +
                                "[source_ir_code_file_path]");
                        return;
                    }
                    String srcPath = args[1];

                    ReverseEngine keyCodeStatRobot = new ReverseEngine(srcPath);

                    keyCodeStatRobot.reverse();
                    break;
                }

                default: {
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}