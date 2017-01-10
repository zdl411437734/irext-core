/**
 * Created by strawmanbobi
 * 2016-08-01
 */

package com.irext.reverser.robot;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.irext.reverser.model.KeyInstance;
import com.irext.reverser.model.RemoteInstance;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RemoteEncoder {

    private static String driver = "com.mysql.jdbc.Driver";
    private static Connection mConnection = null;

    private static final String REMOTE_CONTROLLER_FILE = "/IrRemoteController.xml";

    private static final int REMOTE_TYPE_COMMAND = 1;
    private static final int REMOTE_TYPE_STATUS = 2;

    // xml descriptors
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

    private static final String EX_NODE_IREXT_DOCUMENT = "DOCUMENT";
    private static final String EX_NODE_IREXT_REMOTE = "remote_controller";
    private static final String EX_NODE_IREXT_ID = "id";
    private static final String EX_NODE_IREXT_EXTS = "exts";
    private static final String EX_NODE_IREXT_EXT = "ext";
    private static final String EX_NODE_IREXT_TAG = "tag";
    private static final String EX_NODE_IREXT_TAG_VALUE = "value";
    private static final String EX_NODE_IREXT_TAG_TYPE = "type";

    // connection and data source base
    private String sourceXmlFileBasePath;
    private String outputXmlFileBasePath;
    private String encoderPythonFilePath;
    private String encoderPythonBasePath;
    private String outputBinFileBasePath;
    private String dbHost;
    private String dbName;
    private String dbUser;
    private String dbPassword;
    private String dbURL;

    // intermediate objects
    private List<RemoteInstance> mRemoteInstanceList;
    private List<String> mRemoteXMLList;

    public RemoteEncoder(String sourceXmlFileBasePath, String outputXmlFileBasePath,
                         String encoderPythonFilePath, String encoderPythonBasePath, String outputBinFileBasePath,
                         String dbHost, String dbName, String dbUser, String dbPassword) {
        this.sourceXmlFileBasePath = sourceXmlFileBasePath;
        this.outputXmlFileBasePath = outputXmlFileBasePath;
        this.encoderPythonFilePath = encoderPythonFilePath;
        this.encoderPythonBasePath = encoderPythonBasePath;
        this.outputBinFileBasePath = outputBinFileBasePath;
        this.dbHost = dbHost;
        this.dbName = dbName;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        this.dbURL = "jdbc:mysql://" + dbHost + ":3306/" + dbName;
    }

    public boolean encodeAllCommandRemote() {
        InputStream input = null;
        try {
            ////////// step 0 - initialize DB connection //////////
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
            mRemoteInstanceList = new ArrayList<RemoteInstance>();
            mRemoteXMLList = new ArrayList<String>();

            ////////// step 3 - traverse remote template (excluding AC) from remote controller xml file //////////
            String remoteControllerFile = sourceXmlFileBasePath + REMOTE_CONTROLLER_FILE;
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
                    RemoteInstance remoteInstance = new RemoteInstance();
                    NodeList remoteInfoNodes = remoteItemNode.getChildNodes();
                    for (int remoteInfoIndex = 0; remoteInfoIndex < remoteInfoNodes.getLength(); remoteInfoIndex++) {
                        Node remoteInfo = remoteInfoNodes.item(remoteInfoIndex);
                        if (remoteInfo.getNodeType() == Node.ELEMENT_NODE) {
                            if(remoteInfo.getNodeName().equals(NODE_REMOTE_ID)) {
                                remoteInstance.setmRemoteTemplateID(Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent()));
                            } else if (remoteInfo.getNodeName().equals(NODE_REMOTE_TYPE)) {
                                int remoteType = Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent());
                                remoteInstance.setmRemoteInstanceType(Integer.parseInt(
                                        ((Element) remoteInfo).getTextContent()));
                            } else if (remoteInfo.getNodeName().equals(NODE_REMOTE_KEYS)) {
                                // parse keys
                                // System.out.println("This remote index contains element of keys");
                                List<KeyInstance> keys = new ArrayList<KeyInstance>();
                                NodeList keysNodes = remoteInfo.getChildNodes();
                                for (int keysInfoIndex = 0; keysInfoIndex < keysNodes.getLength(); keysInfoIndex++) {
                                    Node keysInfo = keysNodes.item(keysInfoIndex);
                                    if (keysInfo.getNodeType() == Node.ELEMENT_NODE) {
                                        if (keysInfo.getNodeName().equals(NODE_REMOTE_KEY)) {
                                            // parse key info
                                            KeyInstance key = new KeyInstance();
                                            NodeList keyNodes = keysInfo.getChildNodes();
                                            for (int keyInfoIndex = 0;
                                                 keyInfoIndex < keyNodes.getLength();
                                                 keyInfoIndex++) {
                                                Node keyInfo = keyNodes.item(keyInfoIndex);
                                                if (keyInfo.getNodeType() == Node.ELEMENT_NODE) {
                                                    if (keyInfo.getNodeName().equals(NODE_REMOTE_KEY_ID)) {
                                                        key.setmKeyTemplateID(Integer.parseInt(
                                                                ((Element) keyInfo).getTextContent()));
                                                    } else if (keyInfo.getNodeName().equals(NODE_REMOTE_KEY_PULSE)) {
                                                        String keyPulse = ((Element) keyInfo).getTextContent();
                                                        String pattern = "/d+(,/d+)*";
                                                        Pattern p = Pattern.compile(pattern);
                                                        Matcher m = p.matcher(keyPulse);
                                                        // NOTE: there are only 2 types of key value, one for
                                                        // generic key code, another one for RC-5 typed key code
                                                        if (m.matches() == false) {
                                                            key.setmKeyType(KeyInstance.KEY_TYPE_RC5);
                                                        } else {
                                                            key.setmKeyType(KeyInstance.KEY_TYPE_GENERIC);
                                                        }
                                                        key.setmKeyValue(keyPulse);
                                                    }
                                                }
                                            }
                                            keys.add(key);
                                        }
                                    }
                                }
                                remoteInstance.setmKeyInstanceList(keys);
                            }
                        }
                    }
                    if (REMOTE_TYPE_COMMAND == remoteInstance.getmRemoteInstanceType()) {
                        mRemoteInstanceList.add(remoteInstance);
                        System.out.println("add remote instance " + remoteInstance.getmRemoteTemplateID());
                    } else {
                        System.out.println("the type of remote instance " +
                                remoteInstance.getmRemoteTemplateID() + " is " +
                            REMOTE_TYPE_STATUS);
                    }
                }
            }
            System.out.println(mRemoteInstanceList.size() + " remote instances are parsed");

            ////////// step 4 - generate source key-tag xml file for each remote controller //////////
            for (RemoteInstance remoteInstance : mRemoteInstanceList) {
                // actually , this is
                String outputFilePath = outputXmlFileBasePath + "/yk_remote_" +
                        remoteInstance.getmRemoteTemplateID() + ".bin";

                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document remoteDocument = builder.newDocument();
                remoteDocument.setXmlVersion("1.0");
                Element remoteRoot = remoteDocument.createElement(EX_NODE_IREXT_DOCUMENT);
                remoteDocument.appendChild(remoteRoot);

                Element remoteControllerElement = remoteDocument.createElement(EX_NODE_IREXT_REMOTE);
                remoteRoot.appendChild(remoteControllerElement);

                Element idElement = remoteDocument.createElement(EX_NODE_IREXT_ID);
                idElement.setTextContent(String.valueOf(remoteInstance.getmRemoteTemplateID()));
                remoteControllerElement.appendChild(idElement);

                Element extsElement = remoteDocument.createElement(EX_NODE_IREXT_EXTS);
                remoteControllerElement.appendChild(extsElement);

                List<KeyInstance> keyInstanceList = remoteInstance.getmKeyInstanceList();
                if (null != keyInstanceList) {
                    System.out.println("Will add " + keyInstanceList.size() + " keys to this remote");
                    for (KeyInstance keyInstance : keyInstanceList) {
                        Element extElement = remoteDocument.createElement(EX_NODE_IREXT_EXT);
                        Element tagElement = remoteDocument.createElement(EX_NODE_IREXT_TAG);
                        tagElement.setTextContent(String.valueOf(keyInstance.getmKeyTemplateID()));
                        Element tagValueElement = remoteDocument.createElement(EX_NODE_IREXT_TAG_VALUE);
                        tagValueElement.setTextContent(String.valueOf(keyInstance.getmKeyValue()));
                        Element tagTypeElement = remoteDocument.createElement(EX_NODE_IREXT_TAG_TYPE);
                        tagTypeElement.setTextContent(String.valueOf(keyInstance.getmKeyType()));

                        extElement.appendChild(tagElement);
                        extElement.appendChild(tagValueElement);
                        extElement.appendChild(tagTypeElement);

                        extsElement.appendChild(extElement);
                    }
                }

                TransformerFactory transFactory = TransformerFactory.newInstance();
                Transformer transFormer = transFactory.newTransformer();
                DOMSource domSource = new DOMSource(remoteDocument);
                File file = new File(outputFilePath);
                if(!file.exists()) {
                    file.createNewFile();
                }
                System.out.println("generating remote source file : " + "yk_remote_" +
                        remoteInstance.getmRemoteTemplateID() + ".bin");
                FileOutputStream out = new FileOutputStream(file);
                StreamResult xmlResult = new StreamResult(out);
                transFormer.transform(domSource, xmlResult);
                out.close();
            }
            System.out.println(mRemoteInstanceList.size() + " source xml files are generated in " +
                outputXmlFileBasePath);

            ////////// step 5 - compress key-tag files into binary with dynamic python encoder //////////
            // collect output files
            // NOTE: skip step 5 for IREXT SIRIUS
            /*
            System.out.println("collecting output xml files...");
            getXMLSourceFiles(outputXmlFileBasePath);
            System.out.println("collecting output xml files done");

            for (String srcXMLFile : mRemoteXMLList) {
                String pythonInputArg0 = srcXMLFile;
                String pythonInputArg1 = outputBinFileBasePath + "\\";

                // generate dynamic tag for python encoder according to remote template information
                String remoteTemplateID = pythonInputArg0.substring(pythonInputArg0.lastIndexOf('_') + 1,
                        pythonInputArg0.lastIndexOf('.'));

                String keyString = "";

                String sqlString = "SELECT * FROM remote_template WHERE remote_template_id = ?;";
                PreparedStatement statement = (PreparedStatement) mConnection.prepareStatement(sqlString);
                statement.setInt(1, Integer.parseInt(remoteTemplateID));
                ResultSet resultSet = statement.executeQuery();
                if (resultSet.next()) {
                    keyString = resultSet.getString("related_keys");
                }

                // no auto-tags is allowed
                String tagPythonFileName = encoderPythonBasePath + "\\tags.py";
                String pythonContent = "allTags = [" + keyString + "]";
                FileOutputStream fos = new FileOutputStream(tagPythonFileName);
                fos.write(pythonContent.getBytes());
                fos.close();

                // run python to encode xml files
                Process p = Runtime.getRuntime().exec("python " + encoderPythonFilePath + " "
                        + pythonInputArg0 + " " + pythonInputArg1);
                BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
                String s = null;
                do {
                    s = br.readLine();
                    if (null != s) {
                        System.out.println(s);
                    } else {
                        break;
                    }
                } while(true);
                p.waitFor();
                p.destroy();

                Thread.sleep(500);
            }
            */
        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }

    // utils
    private void getXMLSourceFiles(String filePath) {
        File root = new File(filePath);
        File[] files = root.listFiles();
        for (File file : files) {
            if (!file.isDirectory() && file.getName().contains("yk_remote")) {
                mRemoteXMLList.add(file.getAbsolutePath());
            }
        }
    }
}
