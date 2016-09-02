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
package com.amazon.alexa.avs.auth;

import java.util.HashSet;
import java.util.Set;

import com.amazon.alexa.avs.auth.companionservice.CompanionServiceAuthManager;
import com.amazon.alexa.avs.auth.companionservice.CompanionServiceClient;
import com.amazon.alexa.avs.auth.companionservice.RegCodeDisplayHandler;
import com.amazon.alexa.avs.config.DeviceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Initializes and owns the two ways to provision this device: via a companion service where this
 * device acts as a client, and via a companion application where this device acts as a server.
 */
public class AuthSetup implements AccessTokenListener {

    private static final Logger log = LoggerFactory.getLogger(AuthSetup.class);

    private final DeviceConfig deviceConfig;
    private final RegCodeDisplayHandler regCodeDisplayHandler;
    private final Set<AccessTokenListener> accessTokenListeners = new HashSet<>();

    /**
     * Creates an {@link AuthSetup} object.
     *
     * @param deviceConfig
     *            Information about this device.
     * @param regCodeDisplayHandler
     */
    public AuthSetup(final DeviceConfig deviceConfig, final RegCodeDisplayHandler regCodeDisplayHandler) {
        this.deviceConfig = deviceConfig;
        this.regCodeDisplayHandler = regCodeDisplayHandler;
    }

    public void addAccessTokenListener(AccessTokenListener accessTokenListener) {
        accessTokenListeners.add(accessTokenListener);
    }

    /**
     * Initializes threads for the {@link CompanionServiceClient}, depending on which is selected by the user.
     */
    public void startProvisioningThread() {

        CompanionServiceClient remoteProvisioningClient =
            new CompanionServiceClient(deviceConfig);
        final CompanionServiceAuthManager authManager = new CompanionServiceAuthManager(
            deviceConfig, remoteProvisioningClient, regCodeDisplayHandler, this);

        Thread provisioningThread = new Thread()
        {
            @Override
            public void run() {
                try {
                    authManager.startRemoteProvisioning();
                }
                catch (Exception e) {
                    log.error("Failed to start companion service client", e);
                }
            }
        };
        provisioningThread.start();
    }

    @Override
    public void onAccessTokenReceived(String accessToken) {
        accessTokenListeners.stream().forEach(listener -> listener.onAccessTokenReceived(accessToken));
    }
}
