/**
 * Copyright (c) 2016 Justin Young
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR
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
package com.amazon.alexa.avs.auth.companionservice;

import java.io.IOException;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

import com.amazon.alexa.avs.auth.AccessTokenListener;
import com.amazon.alexa.avs.auth.OAuth2AccessToken;
import com.amazon.alexa.avs.auth.companionservice.CompanionServiceClient.RemoteServiceException;
import com.amazon.alexa.avs.config.DeviceConfig;

public class CompanionServiceAuthManager
{
  /**
   * How long in seconds before trying again to exchange refreshToken for an accessToken.
   */
  private static final int TOKEN_REFRESH_RETRY_INTERVAL_IN_S = 2;

  private final DeviceConfig deviceConfig;

  private final CompanionServiceClient companionServiceClient;

  private final RegCodeDisplayHandler regCodeDisplayHandler;

  private final AccessTokenListener accessTokenListener;

  private final Timer refreshTimer;

  private OAuth2AccessToken token;

  private String sessionId;

  public CompanionServiceAuthManager(DeviceConfig deviceConfig,
                                     CompanionServiceClient remoteProvisioningClient,
                                     RegCodeDisplayHandler regCodeDisplayHandler,
                                     AccessTokenListener accessTokenListener)
  {
    this.deviceConfig = deviceConfig;
    this.companionServiceClient = remoteProvisioningClient;
    this.regCodeDisplayHandler = regCodeDisplayHandler;
    this.accessTokenListener = accessTokenListener;
    this.refreshTimer = new Timer();
  }

  public void startRemoteProvisioning() {
    if (deviceConfig.getCompanionServiceInfo() != null && sessionId != null) {
      try {
        refreshTokens();
      }
      catch (RemoteServiceException e) {
        startNewProvisioningRequest();
      }
    }
    else {
      startNewProvisioningRequest();
    }
  }

  private void startNewProvisioningRequest() {
    CompanionServiceRegCodeResponse response = requestRegistrationCode();
    requestAccessToken(response.getSessionId());
  }

  public CompanionServiceRegCodeResponse requestRegistrationCode() {
    while (true) {
      try {
        CompanionServiceRegCodeResponse regCodeResponse =
            companionServiceClient.getRegistrationCode();

        String regCode = regCodeResponse.getRegCode();

        regCodeDisplayHandler.displayRegCode(regCode);
        return regCodeResponse;
      }
      catch (IOException e) {
        try {
          System.err
              .println("There was a problem connecting to the Companion Service. Trying again in "
                  + TOKEN_REFRESH_RETRY_INTERVAL_IN_S
                  + " seconds. Please make sure it is up and running.");
          Thread.sleep(TOKEN_REFRESH_RETRY_INTERVAL_IN_S * 1000);
        }
        catch (InterruptedException ie) {
        }
      }
    }
  }

  public void requestAccessToken(String sessionId) {
    if (deviceConfig.getCompanionServiceInfo() != null) {
      while (true) {
        try {
          token = companionServiceClient.getAccessToken(sessionId);

          this.sessionId = sessionId;

          refreshTimer.schedule(new RefreshTokenTimerTask(),
              new Date(token.getExpiresTime()));

          accessTokenListener.onAccessTokenReceived(token.getAccessToken());
          break;
        }
        catch (IOException e) {
          try {
            System.err
                .println("There was a problem connecting to the Companion Service. Trying again in "
                    + TOKEN_REFRESH_RETRY_INTERVAL_IN_S
                    + " seconds. Please make sure it is up and running.");
            Thread.sleep(TOKEN_REFRESH_RETRY_INTERVAL_IN_S * 1000);
          }
          catch (InterruptedException ie) {
          }
        }
      }
    }
  }

  private void refreshTokens() {
    if (deviceConfig.getCompanionServiceInfo() != null) {
      requestAccessToken(sessionId);
    }
  }

  /**
   * TimerTask for refreshing accessTokens every hour.
   */
  private class RefreshTokenTimerTask
      extends TimerTask
  {
    @Override
    public void run() {
      refreshTokens();
    }
  }
}
