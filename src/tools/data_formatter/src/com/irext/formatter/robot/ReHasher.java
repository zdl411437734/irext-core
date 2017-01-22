/*
 * Created by strawmanbobi
 * 2017-01-22
 *
 * binary re-hash
 */

package com.irext.formatter.robot;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.ResultSet;

import java.io.File;
import java.io.FileInputStream;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.sql.DriverManager;

public class ReHasher {

    private String mDB;
    private String mDBUser;
    private String mDBPassword;
    private String mBinaryPath;

    private static String driver = "com.mysql.jdbc.Driver";
    private Connection mConnection = null;

    public ReHasher(String db, String dbUser, String dbPassword, String binaryPath) {
        mDB = db;
        mDBUser = dbUser;
        mDBPassword = dbPassword;
        mBinaryPath = binaryPath;
    }

    public boolean rehashBinary() {
        String sqlString;
        String innerSqlString;

        PreparedStatement statement;
        PreparedStatement innerStatement;

        ResultSet resultSet;
        ResultSet innerResultSet;

        try {
            Class.forName(driver);
            mConnection = (Connection) DriverManager.getConnection(mDB, mDBUser, mDBPassword);

            // traverse remote index in db
            System.out.println("re-hash binary code");

            sqlString = "SELECT * FROM remote_index";
            statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
            resultSet = (ResultSet) statement.executeQuery();
            while(resultSet.next()) {
                int id = resultSet.getInt("id");
                String protocol = resultSet.getString("protocol");
                String remote = resultSet.getString("remote");
                String binaryFilePath = mBinaryPath + "/irda_" + protocol + "_" + remote + ".bin";
                System.out.println(binaryFilePath);
                String md5 = getFileMD5(new File(binaryFilePath));
                if (null == md5) {
                    md5 = "00000000000000000000000000000000";
                }
                System.out.println(md5);

                innerSqlString = "UPDATE remote_index SET binary_md5 = ? WHERE id = '" + id + "';";
                innerStatement = (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                innerStatement.setString(1, md5);
                innerStatement.executeUpdate();

                System.out.println("md5 has been updated for code " + protocol + "_" + remote);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }

    public String getFileMD5(File file) {
        if (!file.isFile()) {
            return null;
        }
        MessageDigest digest = null;
        FileInputStream in = null;
        byte buffer[] = new byte[1024];
        int len;
        try {
            digest = MessageDigest.getInstance("MD5");
            in = new FileInputStream(file);
            while ((len = in.read(buffer, 0, 1024)) != -1) {
                digest.update(buffer, 0, len);
            }
            in.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        BigInteger bigInt = new BigInteger(1, digest.digest());
        return bigInt.toString(16);
    }
}
