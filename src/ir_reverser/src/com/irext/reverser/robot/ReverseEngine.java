/*
 * Created by strawmanbobi
 * 2017-01-10
 *
 * reverse engine
 */

package com.irext.reverser.robot;

import java.io.*;

public class ReverseEngine {

    private String mSrcCodeFilePath;

    public ReverseEngine(String srcCodeFile) {
        mSrcCodeFilePath = srcCodeFile;
    }

    public boolean reverse() throws IOException {
        InputStream input;
        BufferedReader reader = null;
        int srcCode[];
        try {
            // step 0 - prepare input file
            input = new FileInputStream(mSrcCodeFilePath);
            reader = new BufferedReader(new InputStreamReader(input));
            StringBuilder out = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                out.append(line);
            }
            reader.close();

            String strSrcCode[] = out.toString().split(",");
            srcCode = new int[strSrcCode.length];

            if (!parseSourceArray(srcCode, strSrcCode)) {
                return false;
            }

            // start analyzing
            // step 1 - recognition of boot

            // step 2 - resolve patterns

            // step 3 - resolve key codes


        } catch (Exception e) {
            e.printStackTrace();
            if (null != reader) {
                reader.close();
            }
        }

        return true;
    }

    // utils
    private boolean parseSourceArray(int[] dest, String[] src) {
        try {
            for (int i = 0; i < src.length; i++) {
                dest[i] = Integer.parseInt(src[i]);
            }
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }
}
