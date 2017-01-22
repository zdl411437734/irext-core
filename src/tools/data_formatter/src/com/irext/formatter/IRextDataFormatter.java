/*
 * Created by strawmanbobi
 * 2017-01-17
 *
 * data formatter for IREXT
 */

package com.irext.formatter;

import com.irext.formatter.robot.DataFormatter;
import com.irext.formatter.robot.ReHasher;

public class IRextDataFormatter {

    private final static int FUNCTION_FORMAT = 0;
    private final static int FUNCTION_REHASH = 1;

    public static void main(String[] args) {
        try {
            int mFunction = Integer.parseInt(args[0]);

            switch(mFunction) {
                case FUNCTION_FORMAT: {
                    if (5 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like IRextDataFormatter [function_code = 0] " +
                                "[source_db] [dest_db] [db_user] [db_password]");
                        return;
                    }
                    String sourceDB = args[1];
                    String destDB = args[2];
                    String dbUser = args[3];
                    String dbPassword = args[4];
                    DataFormatter dataFormatter = new DataFormatter(sourceDB, destDB, dbUser, dbPassword);
                    dataFormatter.dataFormat();
                    break;
                }

                case FUNCTION_REHASH: {
                    if (5 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like IRextDataFormatter [function_code = 1] " +
                                "[db] [db_user] [db_password] [binary_path]");
                        return;
                    }
                    String db = args[1];
                    String dbUser = args[2];
                    String dbPassword = args[3];
                    String binaryPath = args[4];
                    ReHasher rehasher = new ReHasher(db, dbUser, dbPassword, binaryPath);
                    rehasher.rehashBinary();
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