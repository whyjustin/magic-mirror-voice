/**
 * Copyright (c) 2016 Justin Young
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * You may not use this file except in compliance with the License. A copy of the License is located the "LICENSE.txt"
 * file accompanying this source. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */
package com.whyjustin.magicmirror.alexa;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.apache.commons.lang3.StringUtils;

/**
 * Describes the information necessary for the Companion Service method of provisioning.
 */
public class CompanionServiceInformation {
    public static final String SERVICE_URL = "serviceUrl";
    public static final String SSL_CLIENT_KEYSTORE = "sslClientKeyStore";
    public static final String SSL_CLIENT_KEYSTORE_PASSPHRASE = "sslClientKeyStorePassphrase";
    public static final String SSL_CA_CERT = "sslCaCert";

    private final String serviceUrlString;
    private final String sslClientKeyStore;
    private final String sslClientKeyStorePassphrase;
    private final String sslCaCert;

    private URL serviceUrl;

    /**
     * Creates a {@link CompanionServiceInformation} object.
     *
     * @param serviceUrl
     */
    public CompanionServiceInformation(String serviceUrl, String sslClientKeyStore,
                                       String sslClientKeyStorePassphrase, String sslCaCert) {
        this.serviceUrlString = serviceUrl;
        this.sslClientKeyStore = sslClientKeyStore;
        this.sslClientKeyStorePassphrase = sslClientKeyStorePassphrase;
        this.sslCaCert = sslCaCert;
    }

    /**
     * @return serviceUrl.
     */
    public URL getServiceUrl() {
        if (serviceUrl == null) {
            if ( StringUtils.isBlank( serviceUrlString)) {
                throw new AlexaConfig.MalformedConfigException(
                    SERVICE_URL + " is blank in your config file.");
            } else {
                try {
                    this.serviceUrl = new URL(serviceUrlString);
                } catch (MalformedURLException e) {
                    throw new AlexaConfig.MalformedConfigException(
                        SERVICE_URL + " is malformed in your config file.", e);
                }
            }
        }
        return serviceUrl;
    }

    /**
     * @return sslClientKeyStore.
     */
    public String getSslClientKeyStore() {
        return sslClientKeyStore;
    }

    /**
     * @return sslClientKeyStorePassphrase.
     */
    public String getSslClientKeyStorePassphrase() {
        return sslClientKeyStorePassphrase;
    }

    /**
     * @return sslCaCert.
     */
    public String getSslCaCert() {
        return sslCaCert;
    }

    /**
     * Serialize this object to JSON.
     *
     * @return A JSON representation of this object.
     */
    public JsonObject toJson() {
        JsonObjectBuilder builder = Json
            .createObjectBuilder()
            .add(SERVICE_URL, getServiceUrl().toString())
            .add(SSL_CLIENT_KEYSTORE, sslClientKeyStore)
            .add(SSL_CLIENT_KEYSTORE_PASSPHRASE, sslClientKeyStorePassphrase)
            .add(SSL_CA_CERT, sslCaCert);

        return builder.build();
    }

    public boolean isValid() {
        getServiceUrl(); // Verifies that the URL is valid
        if (StringUtils.isBlank(sslClientKeyStore)) {
            throw new AlexaConfig.MalformedConfigException(
                SSL_CLIENT_KEYSTORE + " is blank in your config file.");
        } else {
            File sslClientKeyStoreFile = new File( sslClientKeyStore);
            if (!sslClientKeyStoreFile.exists()) {
                throw new AlexaConfig.MalformedConfigException(
                    sslClientKeyStore + " " + SSL_CLIENT_KEYSTORE + " does not exist.");
            }
        }

        if (StringUtils.isBlank(sslCaCert)) {
            throw new AlexaConfig.MalformedConfigException( SSL_CA_CERT + " is blank in your config file.");
        } else {
            File sslCaCertFile = new File(sslCaCert);
            if (!sslCaCertFile.exists()) {
                throw new AlexaConfig.MalformedConfigException(
                    sslCaCertFile + " " + SSL_CA_CERT + " does not exist.");
            }
        }
        return true;
    }
}
