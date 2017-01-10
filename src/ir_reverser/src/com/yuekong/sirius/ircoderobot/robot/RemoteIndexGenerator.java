/**
 * Created by strawmanbobi
 * 2016-07-20
 */

package com.yuekong.sirius.ircoderobot.robot;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.ResultSet;
import com.yuekong.sirius.ircoderobot.model.*;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.DriverManager;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RemoteIndexGenerator {

    private static String driver = "com.mysql.jdbc.Driver";
    private static Connection mConnection = null;

    private static final String KEY_DESCRIPTOR_FILE = "/IrKey.xml";
    private static final String DEVICE_TYPE_FILE = "/IrDeviceType.xml";
    private static final String BRAND_FILE = "/IrBrand.xml";
    private static final String CITY_FILE = "/IrCityArea.xml";
    private static final String BRAND_REMOTE_REL_FILE = "/IrBrandRemoteRel.xml";
    private static final String SP_REMOTE_REL_FILE = "/IrSpRemoteRel.xml";
    private static final String STB_OPERATOR_FILE = "/IrService_provider_CN.xml";
    private static final String IPTV_FILE = "/IrIPTV.xml";
    private static final String REMOTE_CONTROLLER_FILE = "/IrRemoteController.xml";

    public static final int REMOTE_TYPE_COMMAND = 1;
    public static final int REMOTE_TYPE_STATUS = 2;

    // xml descriptors
    // key descriptors
    private static final String NODE_KEY = "key";
    private static final String NODE_KEY_ID = "id";
    private static final String NODE_KEY_NAME = "name";
    private static final String NODE_KEY_DISPLAY_NAME = "display_name";

    // device type descriptors
    private static final String NODE_DEVICE_TYPE = "device_type";
    private static final String NODE_DEVICE_TYPE_ID = "id";
    private static final String NODE_DEVICE_TYPE_NAME = "name";

    // brand descriptors
    private static final String NODE_BRAND = "brand";
    private static final String NODE_BRAND_ID = "id";
    private static final String NODE_BRAND_NAME = "name";

    // city descriptors
    private static final String NODE_CITY = "city";
    private static final String NODE_CITY_ID = "id";
    private static final String NODE_CITY_NAME = "name";
    private static final String NODE_CITY_AREAS = "areas";
    private static final String NODE_CITY_AREA = "area";

    // operator descriptors
    private static final String NODE_OPERATOR = "service_provider";
    private static final String NODE_CITY_ID_IN_OPR = "city_id";
    private static final String NODE_OPERATOR_NAME = "provider_name";
    private static final String NODE_OPERATOR_TYPE = "type";

    // brand-remote relationship descriptors
    private static final String NODE_BRAND_REMOTE = "item";
    private static final String NODE_DEVICE_TYPE_ID_IN_BRR = "device_type_id";
    private static final String NODE_BRAND_ID_IN_BRR = "brand_id";
    private static final String NODE_REMOTE_ID_IN_BRR = "remote_id";
    private static final String NODE_RANK_IN_BRR = "rank";

    // iptv descriptors
    private static final String NODE_IPTV = "item";
    private static final String NODE_BRAND_ID_IN_IPTV = "brand_id";
    private static final String NODE_REMOTE_IDS = "remote_ids";

    // operator-remote relationship descriptors
    private static final String NODE_SP_STB_REL = "item";
    private static final String NODE_OPERATOR_ID_IN_SSR = "sp_id";
    private static final String NODE_CITY_ID_IN_SSR = "city_id";
    private static final String NODE_REMOTE_ID_IN_SSR = "remote_id";
    private static final String NODE_RANK_IN_SSR = "rank";

    // remote controller descriptors
    private static final String NODE_REMOTE_CONTROLLER = "remote_controller";
    private static final String NODE_REMOTE_ID = "id";
    private static final String NODE_REMOTE_FREQUENCY = "frequency";
    private static final String NODE_REMOTE_TYPE = "type";
    private static final String NODE_REMOTE_EXTS = "exts";
    private static final String NODE_REMOTE_EXT = "ext";
    private static final String NODE_REMOTE_KEYS = "keys";
    private static final String NODE_REMOTE_KEY = "key";
    private static final String NODE_REMOTE_KEY_ID = "id";
    private static final String NODE_REMOTE_KEY_PULSE = "pulse";

    // kookong-ucon cateogry mapping
    // the index of array indicates kookong device type ID while the value of array indicates UCONs'
    // NOTE: IPTV in UCON remote index system is separated from STB, so it should not be in this table
    private static final int[] catetoryMapping = {
            3, // STB
            5, // IPTV
            2, // TV
            4, // Net Box
            6, // DVD
            1, // AC
            8, // Projector
            9, // Stereo
            7, // Fan
            11, // SLR
            10, // Light
    };

    private static final String[] categoryNameMapping = {
            "机顶盒",
            "IPTV",
            "电视机",
            "网络盒子",
            "DVD",
            "空调",
            "投影仪",
            "音响",
            "电风扇",
            "单反相机",
            "灯",
    };

    // connection and data source base
    private String xmlFileBasePath;
    private String acBinFileBasePath;
    private String dbName;
    private String dbUser;
    private String dbPassword;
    private String dbURL = "";

    // sub function
    private int subFunction = -1;

    // intermediate objects
    private List<Category> mCategoryList;
    private List<Brand> mBrandList;
    private List<City> mProvinceList;
    private List<City> mCityList;
    private List<Operator> mOperatorList;
    private List<CategoryBrandRel> mCategoryBrandReList;
    private List<SPStbRel> mOperatorStbRelList;
    private List<BrandRemoteRel> mBrandRemoteRelList;
    private List<IPTV> mIPTVList;
    private List<KeyTemplate> mKeyTemplateList;
    private List<RemoteTemplate> mRemoteTemplateList;
    private ArrayList<String> mACBinFileList;
    private Map<Category, List<KeyTemplate>> mIntersectionKeysByCategory;

    public RemoteIndexGenerator(String xmlFileBasePath, String acBinFileBasePath, String dbHost, String dbName,
                                String dbUser, String dbPassword) {
        this.xmlFileBasePath = xmlFileBasePath;
        this.acBinFileBasePath = acBinFileBasePath;
        this.dbName = dbName;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        this.dbURL = "jdbc:mysql://" + dbHost + ":3306/" + dbName;
    }

    public boolean generateAllRemoteIndexes() {
        InputStream input = null;
        try {
            ////////// step 0 - initialize db connections //////////
            Class.forName(driver);
            System.out.println("URL = " + dbURL + ", user = " + dbUser + ", password = " + dbPassword);
            mConnection = (com.mysql.jdbc.Connection) DriverManager.getConnection(dbURL, dbUser, dbPassword);

            ////////// step 1 - initialize XML parser //////////
            Document doc = null;
            Element root = null;
            NodeList topNodes = null;
            DocumentBuilder domBuilder = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder();

            ////////// step 2 - prepare lists //////////
            mCategoryList = new ArrayList<Category>();
            mBrandList = new ArrayList<Brand>();
            mProvinceList = new ArrayList<City>();
            mCityList = new ArrayList<City>();
            mOperatorList = new ArrayList<Operator>();
            mCategoryBrandReList = new ArrayList<CategoryBrandRel>();
            mOperatorStbRelList = new ArrayList<SPStbRel>();
            mBrandRemoteRelList = new ArrayList<BrandRemoteRel>();
            mIPTVList = new ArrayList<IPTV>();
            mKeyTemplateList = new ArrayList<KeyTemplate>();
            mRemoteTemplateList = new ArrayList<RemoteTemplate>();
            mACBinFileList = new ArrayList<String>();
            mIntersectionKeysByCategory = new HashMap<Category, List<KeyTemplate>>();

            ////////// step 3 - traverse key file and collect key template //////////
            String keyMapFile = xmlFileBasePath + KEY_DESCRIPTOR_FILE;
            System.out.println("traverse KeyTemplate list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(keyMapFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node keyItemNode = topNodes.item(topIndex);
                if (keyItemNode.getNodeType() == Node.ELEMENT_NODE
                        && keyItemNode.getNodeName().equals(NODE_KEY)) {
                    KeyTemplate scanKeyTemplate = new KeyTemplate();
                    NodeList keyInfoNodes = keyItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < keyInfoNodes.getLength(); infoIndex++) {
                        Node keyInfo = keyInfoNodes.item(infoIndex);
                        if (keyInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(keyInfo.getNodeName().equals(NODE_KEY_ID)) {
                                scanKeyTemplate.setmKeyID(Integer.parseInt(((Element) keyInfo).getTextContent()));
                            } else if (keyInfo.getNodeName().equals(NODE_KEY_NAME)) {
                                scanKeyTemplate.setmKeyName(((Element) keyInfo).getTextContent());
                            } else if (keyInfo.getNodeName().equals(NODE_KEY_DISPLAY_NAME)) {
                                scanKeyTemplate.setmKeyDisplayName(((Element) keyInfo).getTextContent());
                            }
                        }
                    }
                    mKeyTemplateList.add(scanKeyTemplate);
                }
            }

            // insert this key into db if not exist
            int insertKeyCount = 0;
            for (KeyTemplate keyTemplate : mKeyTemplateList) {
                String sqlString = "SELECT * FROM key_template WHERE key_id = '" + keyTemplate.getmKeyID() + "'";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this key already exists in template list, do nothing
                    System.out.println("key " + keyTemplate.getmKeyID() +
                            " (" + keyTemplate.getmKeyDisplayName() + ") already exists in key template table");
                } else {
                    // this key does not exist in template list, insert it
                    System.out.println("key " + keyTemplate.getmKeyID() +
                            " (" + keyTemplate.getmKeyDisplayName() + ") does not exist in key template table, add it");

                    String innerSqlString = "INSERT INTO key_template(key_id, key_name, key_display_name) " +
                                    "VALUES (?, ?, ?)";
                    PreparedStatement innerStatement = (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setInt(1, keyTemplate.getmKeyID());
                    innerStatement.setString(2, keyTemplate.getmKeyName());
                    innerStatement.setString(3, keyTemplate.getmKeyDisplayName());
                    innerStatement.executeUpdate();
                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertKeyCount++;
                    }
                }
            }
            System.out.println(mKeyTemplateList.size() + " key templates are parsed, " + insertKeyCount +
                    " have been added");

            // sort key ids and output the array for further use
            int keyIDs[] = new int[mKeyTemplateList.size()];
            for (int i = 0; i < mKeyTemplateList.size(); i++) {
                keyIDs[i] = mKeyTemplateList.get(i).getmKeyID();
            }
            java.util.Arrays.sort(keyIDs);

            System.out.println("\r\n============ KEY list ============");
            for (int i = 0; i < keyIDs.length; i++) {
                System.out.print(keyIDs[i] + ", ");
                if (0 == i % 10) {
                    System.out.println();
                }
            }
            System.out.println("\r\n============ KEY list ============");

            ////////// step 4 - traverse device type file and collect categories //////////

            mCategoryList.add(new Category(0, "机顶盒", "", ""));
            mCategoryList.add(new Category(1, "IPTV", "", ""));
            mCategoryList.add(new Category(2, "电视机", "", ""));
            mCategoryList.add(new Category(3, "网络盒子", "", ""));
            mCategoryList.add(new Category(4, "DVD", "", ""));
            mCategoryList.add(new Category(5, "空调", "", ""));
            mCategoryList.add(new Category(6, "投影仪", "", ""));
            mCategoryList.add(new Category(7, "音响", "", ""));
            mCategoryList.add(new Category(8, "电风扇", "", ""));
            mCategoryList.add(new Category(9, "单反相机", "", ""));
            mCategoryList.add(new Category(10, "灯", "", ""));

            // have some debug
            for (Category category : mCategoryList) {
                System.out.println("category : " + category.getmKookongCategoryID() + ", "
                        + category.getmCategoryName());
            }
            System.out.println(mCategoryList.size() + " categories are found");

            ////////// step 5 - traverse city file and collect cites //////////
            // WARNING: per missing information from kookong original code table,
            // we need to import city manually from external DB or SQL script.


            String cityFile = xmlFileBasePath + CITY_FILE;
            System.out.println("traverse city list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(cityFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            int insertProvinceCount = 0;
            int insertCityCount = 0;
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node cityNode = topNodes.item(topIndex);
                // get root node
                if (cityNode.getNodeType() == Node.ELEMENT_NODE
                        && cityNode.getNodeName().equals(NODE_CITY)) {
                    // get city info node
                    City city = new City();
                    NodeList cityInfoNodes = cityNode.getChildNodes();
                    for(int infoIndex = 0; infoIndex < cityInfoNodes.getLength(); infoIndex++) {
                        Node cityInfo = cityInfoNodes.item(infoIndex);
                        if(cityInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(cityInfo.getNodeName().equals(NODE_CITY_ID)) {
                                city.setmCityCode(((Element) cityInfo).getTextContent());
                            } else if(cityInfo.getNodeName().equals(NODE_CITY_NAME)) {
                                city.setmCityName(((Element)cityInfo).getTextContent());
                                String sqlString = "SELECT * FROM city WHERE code = '"+ city.getmCityCode() +"';";
                                PreparedStatement statement = (PreparedStatement) mConnection
                                        .prepareStatement(sqlString);
                                ResultSet resultSet = (ResultSet) statement.executeQuery();
                                if(resultSet.next()) {
                                    System.out.println("city already exists : " + city.getmCityCode() + ", " +
                                            city.getmCityName());
                                } else {
                                    System.out.println("city does not exist : " + city.getmCityCode() + ", " +
                                            city.getmCityName() + " insert into db") ;

                                    String innerSqlString = "INSERT INTO city(code, name, status) " +
                                            "VALUES (?, ?, '1')";
                                    PreparedStatement innerStatement = (PreparedStatement) mConnection
                                            .prepareStatement(innerSqlString);
                                    innerStatement.setString(1, city.getmCityCode());
                                    innerStatement.setString(2, city.getmCityName());
                                    innerStatement.executeUpdate();
                                    insertProvinceCount ++;
                                }
                            } else if(cityInfo.getNodeName().equals(NODE_CITY_AREAS)) {
                                NodeList areaNodes = cityInfo.getChildNodes();
                                City cityArea = new City();
                                for(int areaIndex = 0; areaIndex < areaNodes.getLength(); areaIndex ++) {
                                    Node areaNode = areaNodes.item(areaIndex);
                                    NodeList areaInfos = areaNode.getChildNodes();
                                    for(int areaInfoIndex = 0; areaInfoIndex < areaInfos.getLength(); areaInfoIndex++) {
                                        Node areaInfo = areaInfos.item(areaInfoIndex);
                                        if(areaInfo.getNodeName().equals(NODE_CITY_ID)) {
                                            cityArea.setmCityCode(((Element) areaInfo).getTextContent());
                                        } else if(areaInfo.getNodeName().equals(NODE_CITY_NAME)) {
                                            cityArea.setmCityName(((Element) areaInfo).getTextContent());

                                            // Insert city area into city table if not exists
                                            String sqlString = "SELECT * FROM city WHERE code = '"+
                                                    cityArea.getmCityCode() +"';";
                                            PreparedStatement statement = (PreparedStatement) mConnection
                                                    .prepareStatement(sqlString);
                                            ResultSet resultSet = (ResultSet) statement.executeQuery();
                                            if(resultSet.next()) {
                                                System.out.println("city area already exists : " +
                                                        cityArea.getmCityCode() + ", " + cityArea.getmCityName());
                                            } else {
                                                System.out.println("city area does not exist : " +
                                                        cityArea.getmCityCode() + ", " + cityArea.getmCityName() +
                                                        " insert into db");
                                                String innerSqlString = "INSERT INTO city(code, name, status) " +
                                                        "VALUES (?, ?, '1')";
                                                PreparedStatement innerStatement = (PreparedStatement) mConnection
                                                        .prepareStatement(innerSqlString);
                                                innerStatement.setString(1, cityArea.getmCityCode());
                                                innerStatement.setString(2, cityArea.getmCityName());
                                                innerStatement.executeUpdate();
                                                insertCityCount ++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    System.out.println(mProvinceList.size() + " provinces have been parsed, " + insertProvinceCount +
                            " have been added");

                    System.out.println(mCityList.size() + " cities have been parsed, " + insertCityCount +
                            " have been added");
                } else {
                    // System.out.println("name of top node = " + ((Element)cityNode).getTextContent());
                }
            }

            ////////// step 6 - traverse operator file and collect operators //////////
            String operatorFile = xmlFileBasePath + STB_OPERATOR_FILE;
            System.out.println("traverse stb operator list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(operatorFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node operatorItemNode = topNodes.item(topIndex);
                if (operatorItemNode.getNodeType() == Node.ELEMENT_NODE
                        && operatorItemNode.getNodeName().equals(NODE_OPERATOR)) {
                    Operator operator = new Operator();

                    // get id from attribute of node
                    NamedNodeMap attributes = operatorItemNode.getAttributes();
                    Node attribute = attributes.item(0);
                    operator.setmKookongOperatorID(attribute.getNodeValue());

                    NodeList operatorInfoNodes = operatorItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < operatorInfoNodes.getLength(); infoIndex++) {
                        Node operatorInfo = operatorInfoNodes.item(infoIndex);
                        if (operatorInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(operatorInfo.getNodeName().equals(NODE_CITY_ID_IN_OPR)) {
                                operator.setmCityCode(((Element) operatorInfo).getTextContent());
                            } else if (operatorInfo.getNodeName().equals(NODE_OPERATOR_NAME)) {
                                operator.setmOperatorName(((Element) operatorInfo).getTextContent());
                            } else if (operatorInfo.getNodeName().equals(NODE_OPERATOR_TYPE)) {
                                operator.setmOperatorType(Integer.parseInt(
                                        ((Element) operatorInfo).getTextContent()));
                            }
                        }
                    }
                    mOperatorList.add(operator);
                }
            }
            for(Operator op : mOperatorList) {
                System.out.println("added op : " + op.toString());
            }

            int insertOperatorCount = 0;
            for (Operator operator : mOperatorList) {
                String sqlString = "SELECT * FROM stb_operator WHERE operator_id = '" +
                        operator.getmKookongOperatorID() + "' AND city_code = '" + operator.getmCityCode() + "'";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this operator already exists in operator list, do nothing
                    System.out.println("operator " + operator.getmKookongOperatorID() +
                            " (" + operator.getmOperatorName() + ") already exists in operator table");
                } else {
                    // this operator does not exist in operator list, insert it
                    System.out.println("operator " + operator.getmKookongOperatorID() +
                            " (" + operator.getmOperatorName() + ") does not exist in key operator table, add it");

                    String cityName = "";
                    String outerSqlString = "SELECT name FROM city WHERE code = '" + operator.getmCityCode() + "';";
                    PreparedStatement outerStatement = (PreparedStatement) mConnection.prepareStatement(outerSqlString);
                    ResultSet outerResultSet = (ResultSet) outerStatement.executeQuery();
                    if(outerResultSet.next()) {
                        cityName = outerResultSet.getString("name");
                    }

                    String innerSqlString = "INSERT INTO stb_operator(operator_id, operator_name, city_code," +
                            " city_name, operator_type) " +
                            "VALUES (?, ?, ?, ?, ?)";
                    PreparedStatement innerStatement = (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setString(1, operator.getmKookongOperatorID());
                    innerStatement.setString(2, operator.getmOperatorName());
                    innerStatement.setString(3, operator.getmCityCode());
                    innerStatement.setString(4, cityName);
                    innerStatement.setInt(5, operator.getmOperatorType());
                    innerStatement.executeUpdate();
                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertOperatorCount++;
                    }
                }
            }

            System.out.println(mOperatorList.size() + " operators are parsed, " + insertOperatorCount +
                    " have been added");

            ////////// step 7 - traverse brand file and collect brands //////////
            String brandFile = xmlFileBasePath + BRAND_FILE;
            System.out.println("traverse brand list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(brandFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node brandItemNode = topNodes.item(topIndex);
                if (brandItemNode.getNodeType() == Node.ELEMENT_NODE
                        && brandItemNode.getNodeName().equals(NODE_BRAND)) {
                    Brand brand = new Brand();
                    NodeList brandInfoNodes = brandItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < brandInfoNodes.getLength(); infoIndex++) {
                        Node brandInfo = brandInfoNodes.item(infoIndex);
                        if (brandInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(brandInfo.getNodeName().equals(NODE_BRAND_ID)) {
                                brand.setmKookongBrandID(Integer.parseInt(
                                        ((Element) brandInfo).getTextContent()));
                            } else if (brandInfo.getNodeName().equals(NODE_DEVICE_TYPE_NAME)) {
                                brand.setmBrandName(((Element) brandInfo).getTextContent());
                            }
                        }
                    }
                    mBrandList.add(brand);
                }
            }
            System.out.println(mBrandList.size() + " brands are parsed");

            ////////// step 8 - traverse brand-remote file and collect brand-remote relationship //////////
            String brandRemoteRelFile = xmlFileBasePath + BRAND_REMOTE_REL_FILE;
            System.out.println("traverse brand remote relationship list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(brandRemoteRelFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();

            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node relItemNode = topNodes.item(topIndex);
                if (relItemNode.getNodeType() == Node.ELEMENT_NODE
                        && relItemNode.getNodeName().equals(NODE_BRAND_REMOTE)) {
                    BrandRemoteRel brandRemoteRel = new BrandRemoteRel();
                    NodeList relInfoNodes = relItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < relInfoNodes.getLength(); infoIndex++) {
                        Node relInfo = relInfoNodes.item(infoIndex);
                        if (relInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(relInfo.getNodeName().equals(NODE_DEVICE_TYPE_ID_IN_BRR)) {
                                brandRemoteRel.setmKookongCategoryID(Integer.parseInt(
                                        ((Element) relInfo).getTextContent()));
                            } else if (relInfo.getNodeName().equals(NODE_BRAND_ID_IN_BRR)) {
                                brandRemoteRel.setmKookongBrandID(Integer.parseInt(
                                        ((Element) relInfo).getTextContent()));
                            } else if (relInfo.getNodeName().equals(NODE_REMOTE_ID_IN_BRR)) {
                                brandRemoteRel.setmKookongRemoteID(Integer.parseInt(
                                        ((Element) relInfo).getTextContent()));
                            } else if (relInfo.getNodeName().equals(NODE_RANK_IN_BRR)) {
                                brandRemoteRel.setmPriority(Integer.parseInt(
                                        ((Element) relInfo).getTextContent()));
                            }
                        }
                    }
                    mBrandRemoteRelList.add(brandRemoteRel);
                }
            }
            System.out.println(mBrandRemoteRelList.size() + " brand-remote item parsed");

            ////////// step 9 - traverse operator-remote relationship from spstbrel xml file //////////
            String operatorRemoteRelFile = xmlFileBasePath + SP_REMOTE_REL_FILE;
            System.out.println("traverse SPStbRel list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(operatorRemoteRelFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node spStbRelItemNode = topNodes.item(topIndex);
                if (spStbRelItemNode.getNodeType() == Node.ELEMENT_NODE
                        && spStbRelItemNode.getNodeName().equals(NODE_SP_STB_REL)) {
                    SPStbRel operatorRemoteRel = new SPStbRel();
                    NodeList spStbRelInfoNodes = spStbRelItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < spStbRelInfoNodes.getLength(); infoIndex++) {
                        Node spStbRelInfo = spStbRelInfoNodes.item(infoIndex);
                        if (spStbRelInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(spStbRelInfo.getNodeName().equals(NODE_OPERATOR_ID_IN_SSR)) {
                                operatorRemoteRel.setmOperatorID(Integer.parseInt(
                                        ((Element) spStbRelInfo).getTextContent()));
                            } else if (spStbRelInfo.getNodeName().equals(NODE_CITY_ID_IN_SSR)) {
                                operatorRemoteRel.setmCityCode(((Element) spStbRelInfo).getTextContent());
                            } else if (spStbRelInfo.getNodeName().equals(NODE_REMOTE_ID_IN_SSR)) {
                                operatorRemoteRel.setmKookongRemoteID(Integer.parseInt(
                                        ((Element) spStbRelInfo).getTextContent()));
                            } else if (spStbRelInfo.getNodeName().equals(NODE_RANK_IN_SSR)) {
                                operatorRemoteRel.setmPriority(Integer.parseInt(
                                        ((Element) spStbRelInfo).getTextContent()));
                            }
                        }
                    }
                    mOperatorStbRelList.add(operatorRemoteRel);
                }
            }
            System.out.println(mOperatorStbRelList.size() + " operator-remote index relationship items are parsed");

            ////////// step 10 - traverse brand-remote relationship from IPTV xml file //////////
            String iptvFile = xmlFileBasePath + IPTV_FILE;
            System.out.println("traverse IPTV list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(iptvFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node iptvItemNode = topNodes.item(topIndex);
                if (iptvItemNode.getNodeType() == Node.ELEMENT_NODE
                        && iptvItemNode.getNodeName().equals(NODE_IPTV)) {
                    IPTV iptv = new IPTV();
                    NodeList iptvInfoNodes = iptvItemNode.getChildNodes();
                    for (int infoIndex = 0; infoIndex < iptvInfoNodes.getLength(); infoIndex++) {
                        Node iptvInfo = iptvInfoNodes.item(infoIndex);
                        if (iptvInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(iptvInfo.getNodeName().equals(NODE_BRAND_ID_IN_IPTV)) {
                                iptv.setmKookongBrandID(Integer.parseInt(
                                        ((Element) iptvInfo).getTextContent()
                                ));
                            } else if (iptvInfo.getNodeName().equals(NODE_REMOTE_IDS)) {
                                String remoteIdsStr = ((Element) iptvInfo).getTextContent();
                                String []remoteIdsList = remoteIdsStr.split(",");
                                List<Integer> remoteIds = new ArrayList<Integer>();
                                for (int remoteIdIndex = 0; remoteIdIndex < remoteIdsList.length; remoteIdIndex++) {
                                    remoteIds.add(Integer.parseInt(remoteIdsList[remoteIdIndex]));
                                }
                                iptv.setmRemoteIDList(remoteIds);
                            }
                        }
                    }
                    mIPTVList.add(iptv);
                }
            }
            System.out.println(mIPTVList.size() + " IPTV brands are parsed");

            ////////// step 11 - traverse remote template (excluding AC) from remote controller xml file //////////
            int validKeys = 0;
            int invalidKeys = 0;
            String remoteControllerFile = xmlFileBasePath + REMOTE_CONTROLLER_FILE;
            System.out.println("traverse remote controller list file");
            if (null != input) {
                input.close();
                input = null;
            }
            input = new FileInputStream(remoteControllerFile);
            doc = domBuilder.parse(input);
            root = doc.getDocumentElement();
            topNodes = root.getChildNodes();
            for (int topIndex = 0; topIndex < topNodes.getLength(); topIndex++) {
                Node remoteItemNode = topNodes.item(topIndex);
                if (remoteItemNode.getNodeType() == Node.ELEMENT_NODE
                        && remoteItemNode.getNodeName().equals(NODE_REMOTE_CONTROLLER)) {
                    RemoteTemplate remoteTemplate = new RemoteTemplate();
                    NodeList remoteInfoNodes = remoteItemNode.getChildNodes();
                    for (int remoteInfoIndex = 0; remoteInfoIndex < remoteInfoNodes.getLength(); remoteInfoIndex++) {
                        Node remoteInfo = remoteInfoNodes.item(remoteInfoIndex);
                        if (remoteInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(remoteInfo.getNodeName().equals(NODE_REMOTE_ID)) {
                                remoteTemplate.setmRemoteTemplateID(Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent()));
                            } else if (remoteInfo.getNodeName().equals(NODE_REMOTE_FREQUENCY)) {
                                remoteTemplate.setmFrequency(Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent()));
                            } else if (remoteInfo.getNodeName().equals(NODE_REMOTE_TYPE)) {
                                remoteTemplate.setmType(Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent()));
                            } else if (remoteInfo.getNodeName().equals(NODE_REMOTE_KEYS)) {
                                // parse keys
                                // System.out.println("This remote index contains element of keys");
                                List<KeyTemplate> keys = new ArrayList<KeyTemplate>();
                                NodeList keysNodes = remoteInfo.getChildNodes();
                                for (int keysInfoIndex = 0; keysInfoIndex < keysNodes.getLength(); keysInfoIndex++) {
                                    Node keysInfo = keysNodes.item(keysInfoIndex);
                                    if (keysInfo.getNodeType() == Node.ELEMENT_NODE) {
                                        if (keysInfo.getNodeName().equals(NODE_REMOTE_KEY)) {
                                            // parse key info
                                            NodeList keyNodes = keysInfo.getChildNodes();
                                            for (int keyInfoIndex = 0; keyInfoIndex < keyNodes.getLength(); keyInfoIndex++) {
                                                Node keyInfo = keyNodes.item(keyInfoIndex);
                                                if (keyInfo.getNodeType() == Node.ELEMENT_NODE) {
                                                    if (keyInfo.getNodeName().equals(NODE_REMOTE_KEY_ID)) {
                                                        KeyTemplate key = new KeyTemplate();
                                                        key.setmKeyID(Integer.parseInt(
                                                                ((Element) keyInfo).getTextContent()));
                                                        keys.add(key);
                                                    } else if (keyInfo.getNodeName().equals(NODE_REMOTE_KEY_PULSE)) {
                                                        String keyPulse = ((Element) keyInfo).getTextContent();
                                                        String pattern = "\\d+(,\\d+)*";
                                                        Pattern p = Pattern.compile(pattern);
                                                        Matcher m = p.matcher(keyPulse);
                                                        if (m.matches() == false) {
                                                            System.out.println("+++++ " + keyPulse);
                                                            invalidKeys ++;
                                                        } else {
                                                            validKeys ++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                remoteTemplate.setmKeyInstanceList(keys);
                            }
                        }
                    }
                    if (REMOTE_TYPE_COMMAND == remoteTemplate.getmType() &&
                            5 != getCategoryOfRemoteIndex(remoteTemplate.getmRemoteTemplateID())) {
                        mRemoteTemplateList.add(remoteTemplate);
                    } else {
                        // do nothing
                    }
                    // note, excluding AC, the left remote indexes added to the remoteIndexList includes: STB(category 0),
                    // TV, IPTV(category 1), BOX, DVD, FAN, STEREO, PROJECTOR, CAMERA and LIGHT
                }
            }
            System.out.println("valid keys = " + validKeys + ", invalid keys = " + invalidKeys);

            ////////// step 12 - build, build, build, WTF. //////////

            // build up remote template according to remote template list
            int insertRemoteTemplateCount = 0;
            for (RemoteTemplate remoteTemplate : mRemoteTemplateList) {
                String sqlString = "SELECT * FROM remote_template WHERE remote_template_id = '" +
                        remoteTemplate.getmRemoteTemplateID() + "'";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this remote template already exists in template list, do nothing
                    System.out.println("remote template " + remoteTemplate.getmRemoteTemplateID() +
                            " already exists in remote template table");
                } else {
                    // this remote template does not exist in template list, insert it
                    System.out.println("remote template " + remoteTemplate.getmRemoteTemplateID() +
                            " does not exist in key template table, add it");

                    String keys = "";
                    List<KeyTemplate> keysList = remoteTemplate.getmKeyInstanceList();

                    // sort key template list by key ID
                    Collections.sort(keysList, new SortByKeyID());
                    for (int i = 0; i < keysList.size(); i++) {
                        KeyTemplate key = keysList.get(i);

                        if (i != keysList.size() - 1) {
                            keys += key.getmKeyID() + ", ";
                        } else {
                            keys += key.getmKeyID();
                        }
                    }

                    String innerSqlString = "INSERT INTO remote_template(remote_template_id, frequency," +
                            " remote_template_type, related_keys) " +
                            "VALUES (?, ?, ?, ?);";
                    PreparedStatement innerStatement = (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setInt(1, remoteTemplate.getmRemoteTemplateID());
                    innerStatement.setInt(2, remoteTemplate.getmFrequency());
                    innerStatement.setInt(3, remoteTemplate.getmType());
                    innerStatement.setString(4, keys);

                    innerStatement.executeUpdate();
                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertRemoteTemplateCount++;
                    }
                }
            }

            System.out.println(mRemoteTemplateList.size() + " remote indexes have been parsed, " +
                insertRemoteTemplateCount + " have been added");

            // build up brand-category relationship according to IPTV list
            int insertedIPTVBrands = 0;
            for (IPTV iptv : mIPTVList) {
                int kookongBrandID = iptv.getmKookongBrandID();
                Brand brand = getKookongBrandByKookongBrandID(kookongBrandID);
                String sqlString = "SELECT * FROM brand WHERE brand_id = " +
                        "'" + iptv.getmKookongBrandID() + "' AND category_id = 5";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this brand for IPTV already exists in brand list, do nothing
                    System.out.println("brand " + iptv.getmKookongBrandID() + ", " +
                            brand.getmBrandName() + " already exists in brand table");
                } else {
                    String innerSqlString = "INSERT INTO brand (brand_id, name, category_id, " +
                            "category_name, status, create_time, priority) VALUES (?, ?, ?, ?, ?, ?, ?);";
                    PreparedStatement innerStatement =
                            (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setInt(1, kookongBrandID);
                    innerStatement.setString(2, brand.getmBrandName());
                    innerStatement.setInt(3, 5);
                    innerStatement.setString(4, "IPTV");
                    innerStatement.setInt(5, 1);
                    innerStatement.setString(6, "2016-07-26 17:00:00");
                    innerStatement.setInt(7, (insertedIPTVBrands + 1) * 10);

                    innerStatement.executeUpdate();
                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertedIPTVBrands++;
                    }
                }
            }
            System.out.println(insertedIPTVBrands + " have been added for category : IPTV");

            // build up brand-category relationship according to brand list and brand-remote-rel list
            // for each category
            for (Category category: mCategoryList) {
                if (1 == category.getmKookongCategoryID()) {
                    // skip IPTV since the brand-category relationship does not come from brand-remote-rel xml
                    continue;
                }
                // reset inserted brand count to 0
                int insertBrandCount = 0;
                for (BrandRemoteRel brandRemoteRel : mBrandRemoteRelList) {

                    // count on this relationship item only if the category matched the current category
                    if (brandRemoteRel.getmKookongCategoryID() == category.getmKookongCategoryID()) {
                        Brand brand = getKookongBrandByKookongBrandID(brandRemoteRel.getmKookongBrandID());

                        if (false == isInCategoryBrandRel(brandRemoteRel.getmKookongCategoryID(),
                                brandRemoteRel.getmKookongBrandID())) {

                            // count this brand only if it hasn't been counted yet
                            int uconCategoryID = getUCONCategoryIDFromCategory(category.getmKookongCategoryID());
                            String uconCategoryName = getUCONCategoryNameFromCategory(category.getmKookongCategoryID());
                            System.out.println(uconCategoryID + ", " + uconCategoryName + ", " +
                                    brand.getmBrandName() + ", rank = " + brandRemoteRel.getmPriority());

                            // insert this brand into brand table
                            String sqlString = "SELECT * FROM brand WHERE brand_id = " +
                                    "'" + brand.getmKookongBrandID() + "' AND category_id = '" + uconCategoryID + "';";
                            PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                            ResultSet resultSet = (ResultSet) statement.executeQuery();
                            if(resultSet.next()) {
                                // this brand already exists in brand list, do nothing
                                System.out.println("brand " + brand.getmKookongBrandID() + ", " +
                                        brand.getmBrandName() + " already exists in brand table");
                            } else {
                                // this brand does not exist in brand list, insert it
                                System.out.println("brand " + brand.getmKookongBrandID() + ", " +
                                        brand.getmBrandName() + " does not exist in key brand table, add it");

                                String innerSqlString = "INSERT INTO brand (brand_id, name, category_id, " +
                                        "category_name, status, create_time, priority) VALUES (?, ?, ?, ?, ?, ?, ?);";

                                PreparedStatement innerStatement =
                                        (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                                innerStatement.setInt(1, brand.getmKookongBrandID());
                                innerStatement.setString(2, brand.getmBrandName());
                                innerStatement.setInt(3, uconCategoryID);
                                innerStatement.setString(4, uconCategoryName);
                                innerStatement.setInt(5, 1);
                                innerStatement.setString(6, "2016-07-26 17:00:00");
                                innerStatement.setInt(7, brandRemoteRel.getmPriority());

                                innerStatement.executeUpdate();
                                ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                                if (innerResultSet.next()) {
                                    Long gk = (Long) innerResultSet.getObject(1);
                                    insertBrandCount++;
                                }
                                insertBrandCount++;
                            }
                            mCategoryBrandReList.add(new CategoryBrandRel(brandRemoteRel.getmKookongCategoryID(),
                                    brandRemoteRel.getmKookongBrandID()));
                        }
                    }
                }
                System.out.println(insertBrandCount + " have been added for category : " + category.getmCategoryName());
            }

            // build up remote index for STB according to city relationship
            int insertStbRemoteIndexCount = 0;
            for (SPStbRel spStbRel : mOperatorStbRelList) {
                int categoryID = 3;
                String categoryName = "机顶盒";
                String cityCode = spStbRel.getmCityCode();
                String cityName = "";

                String outerSqlString = "SELECT name FROM city WHERE code = '" + cityCode + "';";
                PreparedStatement outerStatement = (PreparedStatement) mConnection.prepareStatement(outerSqlString);
                ResultSet outerResultSet = (ResultSet) outerStatement.executeQuery();
                if(outerResultSet.next()) {
                    cityName = outerResultSet.getString("name");
                }

                int operatorID = spStbRel.getmOperatorID();
                String operatorName = "";
                outerSqlString = "SELECT operator_name FROM stb_operator WHERE operator_id = '" + operatorID + "';";
                outerStatement = (PreparedStatement) mConnection.prepareStatement(outerSqlString);
                outerResultSet = (ResultSet) outerStatement.executeQuery();
                if(outerResultSet.next()) {
                    operatorName = outerResultSet.getString("operator_name");
                }

                int remoteTemplateID = spStbRel.getmKookongRemoteID();
                int radioType = 0;
                int status = 1;
                int priority = spStbRel.getmPriority();
                String appliedVersion = "V0.0.0";
                String bannedVersion = "V99.0.0";
                String inputSource = "CodeRobot_V1.0@ucon";

                String sqlString = "SELECT * FROM remote_index WHERE category_id = 3 AND city_code = '" + cityCode +
                        "' AND operator_id = '" + operatorID + "' AND remote_template_id = '" + remoteTemplateID + "';";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this stb remote index already exists, do nothing
                    System.out.println("stb remote index " + cityName + ", " +
                            operatorName + ", " + remoteTemplateID + " already exists");
                } else {
                    System.out.println("stb remote index " + cityName + ", " +
                            operatorName + ", " + remoteTemplateID + " does not exist, add it");
                    String innerSqlString = "INSERT INTO remote_index(category_id, category_name, " +
                            "city_code, city_name, operator_id, operator_name, remote_template_id, " +
                            "radio_type, status, priority, applied_version, banned_version, input_source, update_time) VALUES" +
                            "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    PreparedStatement innerStatement = (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setInt(1, categoryID);
                    innerStatement.setString(2, categoryName);
                    innerStatement.setString(3, cityCode);
                    innerStatement.setString(4, cityName);
                    innerStatement.setInt(5, operatorID);
                    innerStatement.setString(6, operatorName);
                    innerStatement.setInt(7, remoteTemplateID);
                    innerStatement.setInt(8, radioType);
                    innerStatement.setInt(9, status);
                    innerStatement.setInt(10, priority);
                    innerStatement.setString(11, appliedVersion);
                    innerStatement.setString(12, bannedVersion);
                    innerStatement.setString(13, inputSource);
                    innerStatement.setString(14, "2016-07-28 18:30:00");

                    innerStatement.executeUpdate();

                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertStbRemoteIndexCount++;
                    }
                }
            }

            System.out.println(insertStbRemoteIndexCount + " stb remote index items have been added");

            // build up remote index for IPTV according to IPTV list
            for (IPTV iptv : mIPTVList) {
                int categoryID = 5;
                String categoryName = "IPTV";
                int kookongBrandID = iptv.getmKookongBrandID();
                String brandName = "";
                int brandID = 0;

                // NOTE: brandID in brand table indicates the id of 3rd party brand
                String outerSqlString = "SELECT id, name FROM brand WHERE brand_id = '" + kookongBrandID + "' " +
                        "AND category_id = '" + categoryID + "';";
                PreparedStatement outerStatement = (PreparedStatement)mConnection.prepareStatement(outerSqlString);
                ResultSet outerResultSet = (ResultSet) outerStatement.executeQuery();
                if (outerResultSet.next()) {
                    brandID = outerResultSet.getInt("id");
                    brandName = outerResultSet.getString("name");
                }

                List<Integer> remoteIDList = iptv.getmRemoteIDList();

                int remoteIndexCountForIPTVperBrand = 0;
                for (Integer i : remoteIDList) {
                    int remoteTemplateID = i;
                    int radioType = 0;
                    int status = 1;
                    int priority = (remoteIndexCountForIPTVperBrand + 1) * 10;
                    String appliedVersion = "V0.0.0";
                    String bannedVersion = "V99.0.0";
                    String inputSource = "CodeRobot_V1.0@ucon";

                    // NOTE: brandID in remote_index table indicates the id of UCON brand
                    String sqlString = "SELECT * FROM remote_index WHERE category_id = 5 AND brand_id = '" + brandID +
                            "' AND remote_template_id = '" + remoteTemplateID + "';";
                    PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                    ResultSet resultSet = (ResultSet) statement.executeQuery();
                    if(resultSet.next()) {
                        // this iptv remote index already exists, do nothing
                        System.out.println("iptv remote index " + brandName + ", " +
                                remoteTemplateID + " already exists");
                    } else {
                        System.out.println("iptv remote index " + brandName + ", " +
                                remoteTemplateID + " does not exist, add it");
                        String innerSqlString = "INSERT INTO remote_index(category_id, category_name, " +
                                "brand_id, brand_name, remote_template_id, " +
                                "radio_type, status, priority, applied_version, banned_version, input_source, update_time) VALUES" +
                                "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                        PreparedStatement innerStatement =
                                (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                        innerStatement.setInt(1, categoryID);
                        innerStatement.setString(2, categoryName);
                        innerStatement.setInt(3, brandID);
                        innerStatement.setString(4, brandName);
                        innerStatement.setInt(5, remoteTemplateID);
                        innerStatement.setInt(6, radioType);
                        innerStatement.setInt(7, status);
                        innerStatement.setInt(8, priority);
                        innerStatement.setString(9, appliedVersion);
                        innerStatement.setString(10, bannedVersion);
                        innerStatement.setString(11, inputSource);
                        innerStatement.setString(12, "2016-07-28 18:30:00");

                        innerStatement.executeUpdate();

                        ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                        if (innerResultSet.next()) {
                            Long gk = (Long) innerResultSet.getObject(1);
                            remoteIndexCountForIPTVperBrand++;
                        }
                    }
                }
            }
            System.out.println(insertStbRemoteIndexCount + " iptv remote index items have been added");

            // build up remote index for devices of other types according to previous parsed lists

            // prepare valid AC list
            getACBinFiles(acBinFileBasePath);
            int []mValidACIDList = new int[mACBinFileList.size()];
            for(int i = 0; i < mACBinFileList.size(); i++) {
                String fileName = mACBinFileList.get(i);
                mValidACIDList[i] = Integer.parseInt(fileName.substring(12, fileName.indexOf('.')));
                System.out.println("add index " + mValidACIDList[i] + " in list");
            }

            System.out.println("added " + mACBinFileList.size() + " valid AC remote in total");

            // ready to process data
            int insertRemoteIndexCount = 0;
            for (BrandRemoteRel brandRemoteRel : mBrandRemoteRelList) {
                int kookongCategoryID = brandRemoteRel.getmKookongCategoryID();
                if (0 == kookongCategoryID || 1 == kookongCategoryID) {
                    System.out.println("this category belongs to " + kookongCategoryID + " skip it");
                    continue;
                }
                int remoteTemplateID = brandRemoteRel.getmKookongRemoteID();
                if (5 == kookongCategoryID) {
                    if (false == isInIntArray(mValidACIDList, remoteTemplateID, mValidACIDList.length)) {
                        System.out.println("This AC is invalid for UCON : " + remoteTemplateID);
                        continue;
                    }
                }
                int categoryID = getUCONCategoryIDFromCategory(kookongCategoryID);
                String categoryName = getUCONCategoryNameFromCategory(kookongCategoryID);
                int kookongBrandID = brandRemoteRel.getmKookongBrandID();
                String brandName = "";
                int brandID = 0;

                // NOTE: brandID in brand table indicates the id of 3rd party brand
                String outerSqlString = "SELECT id, name FROM brand WHERE brand_id = '" + kookongBrandID + "' " +
                        "AND category_id = '" + categoryID + "';";
                PreparedStatement outerStatement = (PreparedStatement)mConnection.prepareStatement(outerSqlString);
                ResultSet outerResultSet = (ResultSet) outerStatement.executeQuery();
                if (outerResultSet.next()) {
                    brandID = outerResultSet.getInt("id");
                    brandName = outerResultSet.getString("name");
                }
                int radioType = 0;
                int status = 1;
                int priority = brandRemoteRel.getmPriority();
                String appliedVersion = "V0.0.0";
                String bannedVersion = "V99.0.0";
                String inputSource = "CodeRobot_V1.0@ucon";

                // NOTE: brandID in remote_index table indicates the id of UCON brand
                String sqlString = "SELECT * FROM remote_index WHERE category_id = '" + categoryID +"'" +
                        " AND brand_id = '" + brandID + "' AND remote_template_id = '" + remoteTemplateID + "';";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                ResultSet resultSet = (ResultSet) statement.executeQuery();
                if(resultSet.next()) {
                    // this remote index already exists, do nothing
                    System.out.println("remote index " + brandName + ", " +
                            remoteTemplateID + " already exists");
                } else {
                    System.out.println("remote index " + brandName + ", " +
                            remoteTemplateID + " does not exist, add it");
                    String innerSqlString = "INSERT INTO remote_index(category_id, category_name, " +
                            "brand_id, brand_name, remote_template_id, " +
                            "radio_type, status, priority, applied_version, banned_version, input_source, update_time) VALUES" +
                            "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    PreparedStatement innerStatement =
                            (PreparedStatement) mConnection.prepareStatement(innerSqlString);
                    innerStatement.setInt(1, categoryID);
                    innerStatement.setString(2, categoryName);
                    innerStatement.setInt(3, brandID);
                    innerStatement.setString(4, brandName);
                    innerStatement.setInt(5, remoteTemplateID);
                    innerStatement.setInt(6, radioType);
                    innerStatement.setInt(7, status);
                    innerStatement.setInt(8, priority);
                    innerStatement.setString(9, appliedVersion);
                    innerStatement.setString(10, bannedVersion);
                    innerStatement.setString(11, inputSource);
                    innerStatement.setString(12, "2016-07-28 18:30:00");

                    innerStatement.executeUpdate();

                    ResultSet innerResultSet = (ResultSet) innerStatement.getGeneratedKeys();
                    if (innerResultSet.next()) {
                        Long gk = (Long) innerResultSet.getObject(1);
                        insertRemoteIndexCount++;
                    }
                }
            }
            System.out.println(insertRemoteIndexCount + " remote indexes other than STB and IPTV are added");

            ////////// step 13 - verify remote index tree //////////
            String categorySqlString = "SELECT id, name FROM category;";
            PreparedStatement categoryStatement = (PreparedStatement) mConnection.prepareStatement(categorySqlString);
            ResultSet categoryResultSet = (ResultSet) categoryStatement.executeQuery();
            while (categoryResultSet.next()) {
                int categoryID = categoryResultSet.getInt("id");
                String categoryName = categoryResultSet.getString("name");
                System.out.println("verifying category of " + categoryName);
                if (3 != categoryID) {
                    String brandSqlString = "SELECT id, name FROM brand WHERE category_id = '" + categoryID + "';";
                    PreparedStatement brandStatement = (PreparedStatement) mConnection.prepareStatement(brandSqlString);
                    ResultSet brandResultSet = (ResultSet) brandStatement.executeQuery();
                    while (brandResultSet.next()) {
                        int brandID = brandResultSet.getInt("id");
                        String brandName = brandResultSet.getString("name");

                        String remoteIndexSqlString = "SELECT id, remote_template_id FROM remote_index WHERE brand_id = '" +
                                brandID + "';";
                        PreparedStatement remoteIndexStatement =
                                (PreparedStatement) mConnection.prepareStatement(remoteIndexSqlString);
                        ResultSet remoteIndexResultSet = (ResultSet) remoteIndexStatement.executeQuery();
                        int remoteIndexCountPerBrand = 0;
                        while (remoteIndexResultSet.next()) {
                            int remoteIndexID = remoteIndexResultSet.getInt("id");
                            int remoteTemplateID = remoteIndexResultSet.getInt("remote_template_id");
                            String remoteTemplateSqlString = "SELECT * FROM remote_template WHERE " +
                                    "remote_template_id = '" + remoteTemplateID + "';";

                            PreparedStatement remoteTemplateStatement =
                                    (PreparedStatement) mConnection.prepareStatement(remoteTemplateSqlString);

                            ResultSet remoteTemplateResultSet = (ResultSet) remoteTemplateStatement.executeQuery();

                            if (1 == categoryID) {
                                remoteIndexCountPerBrand++;
                            } else {
                                if (remoteTemplateResultSet.next()) {
                                    remoteIndexCountPerBrand++;
                                } else {
                                    System.out.println("remote index " + remoteIndexID + " does not have any matched " +
                                            "template");
                                }
                            }
                        }
                        if (0 == remoteIndexCountPerBrand) {
                            System.out.println("brand " + brandID + ", " + brandName + " does not have any matched " +
                                    "remote index");
                        } else {
                            System.out.println("brand " + brandID + ", " + brandName + " has " +
                                    remoteIndexCountPerBrand + " valid remote indexes");
                        }
                    }
                } else {
                    String citySqlString = "SELECT code, name FROM city WHERE code LIKE '____00' AND code NOT LIKE " +
                            " '__0000'";
                    PreparedStatement cityStatement =  (PreparedStatement) mConnection.prepareStatement(citySqlString);
                    ResultSet cityResultSet = (ResultSet) cityStatement.executeQuery();
                    while (cityResultSet.next()) {
                        String cityCode = cityResultSet.getString("code");
                        String cityName = cityResultSet.getString("name");

                        List<String> operatorIDList = new ArrayList<String>();
                        String operatorSqlString = "SELECT operator_id, operator_name FROM stb_operator WHERE " +
                                "city_code = '" + cityCode + "'";
                        PreparedStatement operatorStatement =
                                (PreparedStatement) mConnection.prepareStatement(operatorSqlString);
                        ResultSet operatorResultSet = (ResultSet) operatorStatement.executeQuery();
                        while(operatorResultSet.next()) {
                            String operatorID = operatorResultSet.getString("operator_id");
                            String operatorName = operatorResultSet.getString("operator_name");
                            operatorIDList.add(operatorID);
                        }
                        if (0 == operatorIDList.size()) {
                            System.out.println("city " + cityName + " does not have any STB operator");
                        }

                        String remoteIndexSqlString = "SELECT id, remote_template_id, operator_id FROM remote_index " +
                                "WHERE city_code = '" + cityCode + "';";
                        PreparedStatement remoteIndexStatement =
                                (PreparedStatement) mConnection.prepareStatement(remoteIndexSqlString);
                        ResultSet remoteIndexResultSet = (ResultSet) remoteIndexStatement.executeQuery();
                        int remoteIndexCountPerCity = 0;
                        while (remoteIndexResultSet.next()) {
                            int remoteIndexID = remoteIndexResultSet.getInt("id");
                            int remoteTemplateID = remoteIndexResultSet.getInt("remote_template_id");
                            String operatorID = remoteIndexResultSet.getString("operator_id");

                            // validate remote index - stb_operator relationship
                            if (null == operatorID ||
                                    operatorID.equals("") ||
                                    false == validateOperator(operatorIDList, operatorID)) {
                                System.out.println("this remote index does not match any stb operators " +
                                        remoteIndexID);
                            }

                            String remoteTemplateSqlString = "SELECT * FROM remote_template WHERE " +
                                    "remote_template_id = '" + remoteTemplateID + "';";

                            PreparedStatement remoteTemplateStatement =
                                    (PreparedStatement) mConnection.prepareStatement(remoteTemplateSqlString);

                            ResultSet remoteTemplateResultSet = (ResultSet) remoteTemplateStatement.executeQuery();

                            if (remoteTemplateResultSet.next()) {
                                remoteIndexCountPerCity++;
                            } else {
                                System.out.println("remote index " + remoteIndexID + " does not have any matched " +
                                "template");
                            }
                        }
                        if (0 == remoteIndexCountPerCity) {
                            System.out.println("city " + cityCode + ", " + cityName + " does not have any matched " +
                                    "remote index");
                        } else {
                            System.out.println("brand " + cityCode + ", " + cityName + " has " +
                                    remoteIndexCountPerCity + " valid remote indexes");
                        }
                    }
                }
                System.out.println("===== verify category done =====");
            }

            ////////// step 14 (optional) - analyze covered key code for each category //////////
            for (int categoryID = 0; categoryID <= 10; categoryID++) {
                if (categoryID == 5) {
                    continue;
                }
                clearKeyHits();
                int remoteIndexCount = 0;
                for (RemoteTemplate remoteTemplate : mRemoteTemplateList) {
                    // traverse remote index category by category
                    if (categoryID == getCategoryOfRemoteIndex(remoteTemplate.getmRemoteTemplateID())) {
                        List<KeyTemplate> keyInstanceList = remoteTemplate.getmKeyInstanceList();
                        for (KeyTemplate ki : keyInstanceList) {
                            // System.out.println("count key hit of key " + ki.getmKeyID());
                            countKeyHits(ki.getmKeyID());
                        }
                        remoteIndexCount++;
                    }
                }
                System.out.println(remoteIndexCount + " remote index found by category " +
                        getUCONCategoryNameFromCategory(categoryID));

                // have some debug on key hits
                for (KeyTemplate keyTemplate : mKeyTemplateList) {
                    if (keyTemplate.getmKeyHit() > 0) {
                        System.out.println("key : " + keyTemplate.getmKeyID() + ", " + keyTemplate.getmKeyName() + ", " +
                                keyTemplate.getmKeyDisplayName() + " HITS = " + keyTemplate.getmKeyHit());
                    }
                }
                System.out.println("======================================");
            }

            System.out.println("==================================== All done ! ====================================");

        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }

    // utils
    private int getCategoryOfRemoteIndex(int remoteIndexID) {
        if (null != mBrandRemoteRelList) {
            for (BrandRemoteRel brr : mBrandRemoteRelList) {
                if (remoteIndexID == brr.getmKookongRemoteID()) {
                    return brr.getmKookongCategoryID();
                }
            }
        }
        return 0;
    }

    private void clearKeyHits() {
        if (null != mKeyTemplateList) {
            for (KeyTemplate kt : mKeyTemplateList) {
                kt.clearKeyHit();
            }
        }
    }

    private void countKeyHits(int keyID) {
        if (null != mKeyTemplateList) {
            for (KeyTemplate kt : mKeyTemplateList) {
                if (kt.getmKeyID() == keyID) {
                    kt.countKeyHit();
                }
            }
        }
    }

    private Category findParentCategoryForBrand(int brandID) {
        if (null != mBrandRemoteRelList) {
            for (BrandRemoteRel brandRemoteRel : mBrandRemoteRelList) {
                if (brandRemoteRel.getmKookongBrandID() == brandID) {
                    Category category = new Category();
                    category.setmCategoryName(brandRemoteRel.getmCategoryName());
                }
            }
        }
        return null;
    }

    private Brand getKookongBrandByKookongBrandID(int kookongBrandID) {
        if (null != mBrandList) {
            for (Brand brand : mBrandList) {
                if (brand.getmKookongBrandID() == kookongBrandID) {
                    return brand;
                }
            }
        }
        return null;
    }

    private City getCityFromCityCode(String cityCode) {
        if (null != mCityList) {
            for (City city : mCityList) {
                if (city.getmCityCode().equals(cityCode)) {
                    return city;
                }
            }
        }
        return null;
    }

    private Operator getOperatorFromOperatorID(String operatorID) {
        if (null != mOperatorList) {
            for (Operator operator : mOperatorList) {
                if (operator.getmKookongOperatorID().equals(operatorID)) {
                    return operator;
                }
            }
        }
        return null;
    }

    private boolean isInCategoryBrandRel(int kookongCategoryID, int kookongBrandID) {
        if (null != mCategoryBrandReList) {
            for (CategoryBrandRel categoryBrandRel : mCategoryBrandReList) {
                if (categoryBrandRel.getKookongBrandID() == kookongBrandID &&
                        categoryBrandRel.getKookongCategoryID() == kookongCategoryID) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean validateOperator(List<String> operatorList, String patten) {
        for (String opStr : operatorList) {
            if (opStr.equals(patten)) {
                return true;
            }
        }
        return false;
    }

    private int getUCONCategoryIDFromCategory(int kookongCategoryID) {
        return catetoryMapping[kookongCategoryID];
    }

    private String getUCONCategoryNameFromCategory(int kookongCategoryID) {
        return categoryNameMapping[kookongCategoryID];
    }

    private void getACBinFiles(String filePath) {
        File root = new File(filePath);
        File[] files = root.listFiles();
        for (File file : files) {
            if (!file.isDirectory() && file.getName().contains("ykir_new_ac")) {
                mACBinFileList.add(file.getName());
            }
        }
    }

    private boolean isInIntArray(int []srcArray, int dest, int length) {
        for(int i = 0; i < length; i++) {
            if(srcArray[i] == dest) {
                return true;
            }
        }
        return false;
    }

    // inner classes
    // key sort comparator
    private class SortByKeyID implements Comparator {
        public int compare(Object o1, Object o2) {
            KeyTemplate k1 = (KeyTemplate) o1;
            KeyTemplate k2 = (KeyTemplate) o2;
            return k1.getmKeyID() > k2.getmKeyID() ? 1 : 0;
        }
    }

    private class CategoryBrandRel {

        private int kookongCategoryID;
        private int kookongBrandID;

        public CategoryBrandRel(int kookongCategoryID, int kookongBrandID) {
            this.kookongCategoryID = kookongCategoryID;
            this.kookongBrandID = kookongBrandID;
        }

        public int getKookongCategoryID() {
            return kookongCategoryID;
        }

        public void setKookongCategoryID(int kookongCategoryID) {
            this.kookongCategoryID = kookongCategoryID;
        }

        public int getKookongBrandID() {
            return kookongBrandID;
        }

        public void setKookongBrandID(int kookongBrandID) {
            this.kookongBrandID = kookongBrandID;
        }
    }
}
