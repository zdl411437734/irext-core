/*
 * Created by strawmanbobi
 * 2017-01-10
 *
 * IR reverse engineering robot for IREXT
 */

package com.irext.reverser;

import com.irext.reverser.robot.DataFormatter;

public class IRextDataFormatter {

    private final static int FUNCTION_REVERSE = 0;

    public static void main(String[] args) {
        try {
            int mFunction = Integer.parseInt(args[0]);

            switch(mFunction) {
                case FUNCTION_REVERSE: {
                    if (3 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like IRextDataFormatter [function_code = 0] " +
                                "[source_db] [dest_db]");
                        return;
                    }
                    String sourceDB = args[1];
                    String destDB = args[2];

                    DataFormatter dataFormatter = new DataFormatter(sourceDB, destDB);

                    dataFormatter.dataFormat();
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