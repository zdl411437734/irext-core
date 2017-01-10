/*
 * Created by strawmanbobi
 * 2016-07-18
 *
 * Sirius IRDA code generating robot
 */

package com.yuekong.sirius.ircoderobot;

import com.yuekong.sirius.ircoderobot.robot.RemoteEncoder;
import com.yuekong.sirius.ircoderobot.robot.RemoteIndexGenerator;

public class SiriusCodeRobot {

    private final static int FUNCTION_GENERATE_REMOTE_INDEX = 0;
    private final static int FUNCTION_GENERATE_REMOTE_BINARY = 1;

    private static int mFunction = 0;

    public static void main(String[] args) {
        try {
            mFunction = Integer.parseInt(args[0]);

            switch(mFunction) {
                case FUNCTION_GENERATE_REMOTE_INDEX: {
                    if (7 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like SiriusCodeRobot [function_code = 0] " +
                                "[source_xml_file_base] [ac_bin_file_base] [db_host] [db_name] [db_user] " +
                                "[db_password]");
                        return;
                    }
                    String sourceXmlFileBase = args[1];
                    String acBinFileBase = args[2];
                    String dbHost = args[3];
                    String dbName = args[4];
                    String dbUser = args[5];
                    String dbPassword = args[6];

                    RemoteIndexGenerator keyCodeStatRobot = new RemoteIndexGenerator(sourceXmlFileBase, acBinFileBase,
                            dbHost, dbName, dbUser, dbPassword);

                    keyCodeStatRobot.generateAllRemoteIndexes();
                    break;
                }

                case FUNCTION_GENERATE_REMOTE_BINARY: {
                    if (10 != args.length) {
                        System.out.println("invalid parameter");
                        System.out.println("Please call this method like SiriusCodeRobot [function_code = 1] " +
                                "[source_xml_file_base] [output_xml_file_base] [encoder_python_file] " +
                                "[encoder_python_base] [output_bin_file_base] [db_host] [db_name] [db_user] " +
                                "[db_password]");
                        return;
                    }
                    String sourceXmlFileBase = args[1];
                    String outputXmlFileBase = args[2];
                    String encoderPythonFile = args[3];
                    String encoderPythonBase = args[4];
                    String outputBinFileBase = args[5];
                    String dbHost = args[6];
                    String dbName = args[7];
                    String dbUser = args[8];
                    String dbPassword = args[9];

                    RemoteEncoder remoteEncoder = new RemoteEncoder(sourceXmlFileBase,
                            outputXmlFileBase,
                            encoderPythonFile,
                            encoderPythonBase,
                            outputBinFileBase,
                            dbHost,
                            dbName,
                            dbUser,
                            dbPassword);

                    remoteEncoder.encodeAllCommandRemote();
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {

        }
    }
}