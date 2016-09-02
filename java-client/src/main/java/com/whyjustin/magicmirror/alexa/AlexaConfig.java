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

import java.net.MalformedURLException;
import java.net.URL;

import org.apache.commons.lang3.StringUtils;

/**
 * Container that encapsulates all the information that exists in the config file.
 */
public class AlexaConfig
{
  private static final String DEFAULT_HOST = "https://avs-alexa-na.amazon.com";

  /*
   * Required parameters from the config file.
   */
  private final String productId;

  private final String dsn;

  private final URL avsHost;

  /*
   * Optional parameters from the config file.
   */
  private CompanionServiceInformation companionServiceInfo;

  /**
   * Creates a {@link AlexaConfig} object.
   *
   * @param productId
   *            The productId of this device.
   * @param dsn
   *            The dsn of this device.
   * @param companionServiceInfo
   *            The information necessary for the Companion Service method of provisioning.
   */
  public AlexaConfig(String productId, String dsn, CompanionServiceInformation companionServiceInfo) {
    if (StringUtils.isBlank(productId)) {
      throw new IllegalArgumentException("productId is required.");
    }

    if (StringUtils.isBlank(dsn)) {
      throw new IllegalArgumentException("dsn is required.");
    }

    if (!companionServiceInfo.isValid()) {
      throw new IllegalArgumentException("companionService is required.");
    }

    this.productId = productId;
    this.dsn = dsn;
    this.companionServiceInfo = companionServiceInfo;

    try {
      this.avsHost = new URL(DEFAULT_HOST);
    }
    catch (MalformedURLException e) {
      throw new MalformedConfigException(DEFAULT_HOST + " is malformed in your config file.", e);
    }
  }

  /**
   * @return avsHost.
   */
  public URL getAvsHost() {
    return avsHost;
  }

  /**
   * @return productId.
   */
  public String getProductId() {
    return productId;
  }

  /**
   * @return dsn.
   */
  public String getDsn() {
    return dsn;
  }

  /**
   * @return companionServiceInfo.
   */
  public CompanionServiceInformation getCompanionServiceInfo() {
    return companionServiceInfo;
  }

  @SuppressWarnings("javadoc")
  public static class MalformedConfigException
      extends RuntimeException
  {
    private static final long serialVersionUID = 1L;

    public MalformedConfigException(String message, Throwable cause) {
      super(message, cause);
    }

    public MalformedConfigException(String s) {
      super(s);
    }
  }
}
