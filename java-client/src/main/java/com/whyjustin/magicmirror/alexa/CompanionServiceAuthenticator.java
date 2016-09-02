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
package com.whyjustin.magicmirror.alexa;

import java.io.IOException;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

import com.amazon.alexa.avs.auth.OAuth2AccessToken;
import com.amazon.alexa.avs.auth.companionservice.CompanionServiceClient;
import com.amazon.alexa.avs.auth.companionservice.CompanionServiceRegCodeResponse;

/**
 * Authenticator for Companion Service. Will only work in a single tenanted environment, in particular the instance
 * where a Magic Mirror spins up this client for its own use.
 */
public class CompanionServiceAuthenticator
{
  private final AlexaConfig alexaConfig;

  private final CompanionServiceClient serviceClient;

  private final Timer refreshTimer;

  private OAuth2AccessToken token;

  private String sessionId;

  public CompanionServiceAuthenticator(final AlexaConfig alexaConfig) {
    this.alexaConfig = alexaConfig;
    serviceClient = new CompanionServiceClient(alexaConfig);
    refreshTimer = new Timer();
  }

  public String requestRegistrationCode() throws IOException {
    CompanionServiceRegCodeResponse regCodeResponse = serviceClient.getRegistrationCode();
    this.sessionId = regCodeResponse.getSessionId();
    return regCodeResponse.getRegCode();
  }

  public String requestAccessToken() {
    try {
      token = serviceClient.getAccessToken(sessionId);

      refreshTimer.schedule(new RefreshTokenTimerTask(), new Date(token.getExpiresTime()));

      return token.getAccessToken();
    }
    catch (IOException ex) {
      System.err.println("Failed to refresh Alexa token.");
      System.exit(1);
      return "";
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
      requestAccessToken();
    }
  }
}
