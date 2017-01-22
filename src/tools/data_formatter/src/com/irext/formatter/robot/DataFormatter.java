/*
 * Created by strawmanbobi
 * 2017-01-17
 *
 * data formatter
 */

package com.irext.formatter.robot;

import com.irext.formatter.utils.VeDate;
import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.ResultSet;

import java.io.*;
import java.sql.DriverManager;

public class DataFormatter {

    private String mSourceDB;
    private String mDestDB;
    private String mDBUser;
    private String mDBPassword;

    private static String driver = "com.mysql.jdbc.Driver";
    private Connection mSourceConnection = null;
    private Connection mDestConnection = null;

    public DataFormatter(String sourceDB, String destDB, String dbUser, String dbPassword) {
        mSourceDB = sourceDB;
        mDestDB = destDB;
        mDBUser = dbUser;
        mDBPassword = dbPassword;
    }

    public boolean dataFormat() {
        String srcSqlString;
        String innerSrcSqlString;
        String destSqlString;
        String innerDestSqlString;

        PreparedStatement srcStatement;
        PreparedStatement innerSrcStatement;
        PreparedStatement destStatement;
        PreparedStatement innerDestStatement;

        ResultSet srcResultSet;
        ResultSet innerSrcResultSet;
        ResultSet destResultSet;
        ResultSet innerDestResultSet;

        try {
            Class.forName(driver);
            mSourceConnection = (com.mysql.jdbc.Connection) DriverManager.getConnection(mSourceDB, mDBUser, mDBPassword);
            mDestConnection = (com.mysql.jdbc.Connection) DriverManager.getConnection(mDestDB, mDBUser, mDBPassword);

            // format ir protocol
            System.out.println("format ir_protocol");

            srcSqlString = "SELECT * FROM ir_protocol";
            srcStatement = (PreparedStatement) mSourceConnection.prepareStatement(srcSqlString);
            srcResultSet = (ResultSet) srcStatement.executeQuery();
            while(srcResultSet.next()) {
                int id = srcResultSet.getInt("id");
                String name = srcResultSet.getString("name");
                int status = srcResultSet.getInt("status");
                int type = srcResultSet.getInt("type");

                innerDestSqlString = "SELECT * FROM ir_protocol WHERE name = '" + name + "';";
                innerDestStatement = (PreparedStatement) mSourceConnection.prepareStatement(innerDestSqlString);
                innerDestResultSet = (ResultSet) innerDestStatement.executeQuery();
                if (!innerDestResultSet.next()) {
                    destSqlString = "INSERT INTO ir_protocol(name, status, type, update_time, contributor, boot_code) " +
                            "VALUES (?, ?, ?, ?, ?, ?);";
                    destStatement = (PreparedStatement) mDestConnection.prepareStatement(destSqlString);
                    destStatement.setString(1, name);
                    destStatement.setInt(2, status);
                    destStatement.setInt(3, type);
                    destStatement.setString(4, VeDate.getStringDateShort());
                    destStatement.setString(5, "formatter");
                    destStatement.setString(6, "");

                    destStatement.executeUpdate();

                    System.out.println("protocol " + name + " has been created");
                }
            }

            // format table category
            System.out.println("format category");

            srcSqlString = "SELECT * FROM category";
            srcStatement = (PreparedStatement) mSourceConnection.prepareStatement(srcSqlString);
            srcResultSet = (ResultSet) srcStatement.executeQuery();
            while(srcResultSet.next()) {
                int id = srcResultSet.getInt("id");
                String name = srcResultSet.getString("name");
                int status = srcResultSet.getInt("status");
                String nameEn = srcResultSet.getString("name_en");
                String nameTw = srcResultSet.getString("name_tw");

                innerDestSqlString = "SELECT * FROM category WHERE name = '" + name + "';";
                innerDestStatement = (PreparedStatement) mDestConnection.prepareStatement(innerDestSqlString);
                innerDestResultSet = (ResultSet) innerDestStatement.executeQuery();
                if (!innerDestResultSet.next()) {
                    destSqlString = "INSERT INTO category(name, status, update_time, name_en, name_tw, contributor) " +
                            "VALUES (?, ?, ?, ?, ?, ?);";
                    destStatement = (PreparedStatement) mDestConnection.prepareStatement(destSqlString);
                    destStatement.setString(1, name);
                    destStatement.setInt(2, status);
                    destStatement.setString(3, VeDate.getStringDateShort());
                    destStatement.setString(4, nameEn);
                    destStatement.setString(5, nameTw);
                    destStatement.setString(6, "formatter");

                    destStatement.executeUpdate();

                    System.out.println("category " + name + " has been created");
                }
            }

            // format table brand
            System.out.println("format brand");

            srcSqlString = "SELECT * FROM brand";
            srcStatement = (PreparedStatement) mSourceConnection.prepareStatement(srcSqlString);
            srcResultSet = (ResultSet) srcStatement.executeQuery();
            while(srcResultSet.next()) {
                int id = srcResultSet.getInt("id");
                String name = srcResultSet.getString("name");

                // TODO: optimize category ID fetcher
                int categoryID = srcResultSet.getInt("category_id");
                String categoryName = srcResultSet.getString("category_name");
                int status = srcResultSet.getInt("status");
                int priority = srcResultSet.getInt("priority");
                String nameEn = srcResultSet.getString("name_en");
                String nameTw = srcResultSet.getString("name_tw");

                innerDestSqlString = "SELECT * FROM brand WHERE name = '" + name +
                        "' AND category_id = '" + categoryID + "';";
                innerDestStatement = (PreparedStatement) mDestConnection.prepareStatement(innerDestSqlString);
                innerDestResultSet = (ResultSet) innerDestStatement.executeQuery();
                if (!innerDestResultSet.next()) {
                    destSqlString = "INSERT INTO brand(name, category_id, category_name, " +
                            "status, update_time, priority, name_en, name_tw, contributor) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    destStatement = (PreparedStatement) mDestConnection.prepareStatement(destSqlString);
                    destStatement.setString(1, name);
                    destStatement.setInt(2, categoryID);
                    destStatement.setString(3, categoryName);
                    destStatement.setInt(4, status);
                    destStatement.setString(5, VeDate.getStringDateShort());
                    destStatement.setInt(6, priority);
                    destStatement.setString(7, nameEn);
                    destStatement.setString(8, nameTw);
                    destStatement.setString(9, "formatter");

                    destStatement.executeUpdate();

                    System.out.println("brand " + name + " of "+ categoryName + " has been created");
                }
            }

            // format table remote_index
            System.out.println("format remote index");

            srcSqlString = "SELECT * FROM remote_index_ii";
            srcStatement = (PreparedStatement) mSourceConnection.prepareStatement(srcSqlString);
            srcResultSet = (ResultSet) srcStatement.executeQuery();
            while(srcResultSet.next()) {
                int id = srcResultSet.getInt("id");

                // TODO: optimize category ID fetcher
                int categoryID = srcResultSet.getInt("category_id");
                String categoryName = srcResultSet.getString("category_name");
                String brandName = srcResultSet.getString("brand_name");
                String cityCode = srcResultSet.getString("city_code");
                String cityName = srcResultSet.getString("city_name");
                String operatorID = srcResultSet.getString("operator_id");
                String operatorName = srcResultSet.getString("operator_name");
                String categoryNameTw = srcResultSet.getString("category_name_tw");
                String brandNameTw = srcResultSet.getString("brand_name_tw");
                String operatorNameTw = srcResultSet.getString("operator_name_tw");
                String cityNameTw = srcResultSet.getString("city_name_tw");

                String protocol = srcResultSet.getString("protocol");
                String remote = srcResultSet.getString("remote");
                String remoteMap = srcResultSet.getString("remote_map");

                int status = srcResultSet.getInt("status");
                int subCate = srcResultSet.getInt("sub_cate");
                int priority = srcResultSet.getInt("priority");
                String binaryMD5 = srcResultSet.getString("binary_md5");

                int brandID = 0;

                if (3 != categoryID) {
                    innerDestSqlString = "SELECT * FROM remote_index WHERE category_id = '" + categoryID + "' AND " +
                            "brand_name = '" + brandName + "';";
                    innerDestStatement = (PreparedStatement) mDestConnection.prepareStatement(innerDestSqlString);
                    innerDestResultSet = (ResultSet) innerDestStatement.executeQuery();
                    if (innerDestResultSet.next()) {
                        brandID = innerDestResultSet.getInt("id");
                    } else {
                        brandID = 0;
                    }
                } else {
                    brandID = 0;
                }

                if (3 != categoryID) {
                    innerDestSqlString = "SELECT * FROM remote_index WHERE category_name = '" + categoryName + "' AND " +
                            "brand_name = '" + brandName + "' AND protocol = '" + protocol + "' AND " +
                            "remote = '" + remote + "';";
                } else {
                    innerDestSqlString = "SELECT * FROM remote_index WHERE category_name = '" + categoryName + "' AND " +
                            "city_code = '" + cityCode + "' AND protocol = '" + protocol + "' AND " +
                            "remote = '" + remote + "';";
                }

                innerDestStatement = (PreparedStatement) mDestConnection.prepareStatement(innerDestSqlString);
                innerDestResultSet = (ResultSet) innerDestStatement.executeQuery();
                if (!innerDestResultSet.next()) {
                    destSqlString = "INSERT INTO remote_index(category_id, category_name, brand_id, brand_name, " +
                            "city_code, city_name, operator_id, operator_name, category_name_tw, brand_name_tw, " +
                            "city_name_tw, operator_name_tw, protocol, remote, remote_map, status, sub_cate," +
                            "priority, remote_number, binary_md5, update_time, contributor) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    destStatement = (PreparedStatement) mDestConnection.prepareStatement(destSqlString);

                    destStatement.setInt(1, categoryID);
                    destStatement.setString(2, categoryName);
                    destStatement.setInt(3, brandID);
                    destStatement.setString(4, brandName);
                    destStatement.setString(5, cityCode);
                    destStatement.setString(6, cityName);
                    destStatement.setString(7, operatorID);
                    destStatement.setString(8, operatorName);
                    destStatement.setString(9, categoryNameTw);
                    destStatement.setString(10, brandNameTw);
                    destStatement.setString(11, cityNameTw);
                    destStatement.setString(12, operatorNameTw);
                    destStatement.setString(13, protocol);
                    destStatement.setString(14, remote);
                    destStatement.setString(15, remoteMap);
                    destStatement.setInt(16, status);
                    destStatement.setInt(17, subCate);
                    destStatement.setInt(18, priority);
                    destStatement.setString(19, id + "");
                    destStatement.setString(20, binaryMD5);
                    destStatement.setString(21, VeDate.getStringDateShort());
                    destStatement.setString(22, "formatter");
                    destStatement.executeUpdate();
                    System.out.println("remote " + remoteMap + " has been created");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }
}
