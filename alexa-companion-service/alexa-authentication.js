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
 * ************************
 * Amazon Software License
 * ************************
 *
 * 1. Definitions
 * “Licensor” means any person or entity that distributes its Work.
 *
 * “Software” means the original work of authorship made available under this License.
 *
 *  “Work” means the Software and any additions to or derivative works of the Software that are made available under this License.
 *
 * The terms “reproduce,” “reproduction,” “derivative works,” and “distribution” have the meaning as provided under U.S. copyright law; provided, however, that for the purposes of this License, derivative works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work.
 *
 * Works, including the Software, are “made available” under this License by including in or with the Work either (a) a copyright notice referencing the applicability of this License to the Work, or (b) a copy of this License.
 * 2. License Grants
 * 2.1 Copyright Grant. Subject to the terms and conditions of this License, each Licensor grants to you a perpetual, worldwide, non-exclusive, royalty-free, copyright license to reproduce, prepare derivative works of, publicly display, publicly perform, sublicense and distribute its Work and any resulting derivative works in any form.
 * 2.2 Patent Grant. Subject to the terms and conditions of this License, each Licensor grants to you a perpetual, worldwide, non-exclusive, royalty-free patent license to make, have made, use, sell, offer for sale, import, and otherwise transfer its Work, in whole or in part. The foregoing license applies only to the patent claims licensable by Licensor that would be infringed by Licensor’s Work (or portion thereof) individually and excluding any combinations with any other materials or technology.
 * 3. Limitations
 * 3.1 Redistribution. You may reproduce or distribute the Work only if (a) you do so under this License, (b) you include a complete copy of this License with your distribution, and (c) you retain without modification any copyright, patent, trademark, or attribution notices that are present in the Work.
 * 3.2 Derivative Works. You may specify that additional or different terms apply to the use, reproduction, and distribution of your derivative works of the Work (“Your Terms”) only if (a) Your Terms provide that the use limitation in Section 3.3 applies to your derivative works, and (b) you identify the specific derivative works that are subject to Your Terms. Notwithstanding Your Terms, this License (including the redistribution requirements in Section 3.1) will continue to apply to the Work itself.
 * 3.3 Use Limitation. The Work and any derivative works thereof only may be used or intended for use with the web services, computing platforms or applications provided by Amazon.com, Inc. or its affiliates, including Amazon Web Services, Inc.
 * 3.4 Patent Claims. If you bring or threaten to bring a patent claim against any Licensor (including any claim, cross-claim or counterclaim in a lawsuit) to enforce any patents that you allege are infringed by any Work, then your rights under this License from such Licensor (including the grants in Sections 2.1 and 2.2) will terminate immediately.
 * 3.5 Trademarks. This License does not grant any rights to use any Licensor’s or its affiliates’ names, logos, or trademarks, except as necessary to reproduce the notices described in this License.
 * 3.6 Termination. If you violate any term of this License, then your rights under this License (including the grants in Sections 2.1 and 2.2) will terminate immediately.
 * 4. Disclaimer of Warranty.
 * THE WORK IS PROVIDED “AS IS” WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OR CONDITIONS OF M ERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE OR NON-INFRINGEMENT. YOU BEAR THE RISK OF UNDERTAKING ANY ACTIVITIES UNDER THIS LICENSE. SOME STATES’ CONSUMER LAWS DO NOT ALLOW EXCLUSION OF AN IMPLIED WARRANTY, SO THIS DISCLAIMER MAY NOT APPLY TO YOU.
 * 5. Limitation of Liability.
 * EXCEPT AS PROHIBITED BY APPLICABLE LAW, IN NO EVENT AND UNDER NO LEGAL THEORY, WHETHER IN TORT (INCLUDING NEGLIGENCE), CONTRACT, OR OTHERWISE SHALL ANY LICENSOR BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR RELATED TO THIS LICENSE, THE USE OR INABILITY TO USE THE WORK (INCLUDING BUT NOT LIMITED TO LOSS OF GOODWILL, BUSINESS INTERRUPTION, LOST PROFITS OR DATA, COMPUTER FAILURE OR MALFUNCTION, OR ANY OTHER COMM ERCIAL DAMAGES OR LOSSES), EVEN IF THE LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 * Effective Date – April 18, 2008 © 2008 Amazon.com, Inc. or its affiliates. All rights reserved.
 */
function buildAlexaAuthentication(config) {
  var crypto = require('crypto');
  var https = require('https');
  var uuid = require('node-uuid');

  var auth = {};

  var sessionIds = [];
  var sessionIdToDeviceInfo = {};
  var regCodeToSessionId = {};
  var pendingStateToRegCode = {};
  var sessionIdToRefreshToken = {};

  var REG_NUM_BYTES = 12;
  var PRODUCT_MAX_LENGTH = 384;
  var PRODUCT_MIN_LENGTH = 1;
  var DSN_MIN_LENGTH = 1;

  var UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  var oAuthServer = 'https://' + config.lwaRedirectHost + '/ap/oa';
  var lwaProdAuthUrl = oAuthServer + '?client_id=' + config.clientId + '&response_type=code&redirect_uri=' +
      config.redirectUrl;

  /**
   * Create an error object to return to the user.
   *
   * @param name The name of the error.
   * @param msg The message associated with the error.
   * @param status The HTTP status code for the error.
   * @returns The error.
   */
  function error(name, msg, status) {
    var err = new Error();
    err.name = name;
    err.message = msg;
    err.status = status;
    return err;
  }

  /**
   * Create an object of relevant LWA HTTP request information.
   *
   * @param urlPath The LWA host.
   * @returns LWA HTTP request information.
   */
  function getLwaPostOptions(urlPath) {
    return {
      host: config.lwaApiHost,
      path: urlPath,
      method: 'POST',
      port: 443,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      rejectUnauthorized: config.validateCertChain
    };
  }

  /**
   * Redirect the user to the LWA page to authenticate.
   *
   * @param deviceInfo Device information including productId and dsn.
   * @param regCode The regCode passed in from the user.
   * @param res The HTTP response object.
   */
  function redirectToDeviceAuthenticate(deviceInfo, regCode, res) {
    res.statusCode = 302;

    var state = uuid.v4();
    var productScope = {
      productID: deviceInfo.productId,
      productInstanceAttributes: {deviceSerialNumber: deviceInfo.dsn}
    };
    var scopeData = {};
    scopeData['alexa:all'] = productScope;

    var scopeDataStr = '&scope=' + encodeURIComponent('alexa:all') + '&state=' + encodeURIComponent(state) +
        '&scope_data=' + encodeURIComponent(JSON.stringify(scopeData));
    var authUrl = lwaProdAuthUrl + scopeDataStr;

    pendingStateToRegCode[state] = regCode;

    res.setHeader("Location", authUrl);
    res.end();
  }

  /**
   * Determine if the user provided productId and dsn match the known map.
   *
   * @param productId The productId.
   * @param dsn The dsn.
   * @returns {Boolean}
   */
  function isValidDevice(productId, dsn) {
    if (productId.length >= PRODUCT_MIN_LENGTH &&
        productId.length <= PRODUCT_MAX_LENGTH &&
        dsn.length >= DSN_MIN_LENGTH &&
        config.products[productId] &&
        config.products[productId].indexOf(dsn) >= 0) {
      return true;
    }

    return false;
  }

  /**
   * Generate a registration code for a device, and map it to the device.
   *
   * The registration code is used by the user as a key to know what device to associate tokens with.
   *
   * @param productId The productId.
   * @param dsn The dsn.
   * @param callback The callback(err, json) to return data to the user.
   */
  auth.getRegCode = function(productId, dsn, callback) {
    var missingProperties = [];
    if (!productId) {
      missingProperties.push("productId");
    }

    if (!dsn) {
      missingProperties.push("dsn");
    }

    if (missingProperties.length > 0) {
      callback(error("MissingParams",
          "The following parameters were missing or empty strings: " + missingProperties.join(", "), 400));
      return;
    }

    if (!isValidDevice(productId, dsn)) {
      callback(error("BadRequest", "The provided product and dsn do not match valid values", 400));
      return;
    }

    crypto.randomBytes(REG_NUM_BYTES, function(err, regCodeBuffer) {
      if (err) {
        console.log("failed on generate bytes", err);
        callback(error("InternalError", "Failure generating code", 500));
        return;
      }
      else {
        var regCode = regCodeBuffer.toString('hex');
        var sessionId = uuid.v4();
        sessionIds.push(sessionId);
        regCodeToSessionId[regCode] = sessionId;
        sessionIdToDeviceInfo[sessionId] = {
          productId: productId,
          dsn: dsn
        };

        reply = {
          regCode: regCode,
          sessionId: sessionId
        };

        callback(null, reply);
      }
    });
  };

  /**
   * Get an accessToken associated with the sessionId.
   *
   * Makes a request to LWA to get accessToken given the stored refreshToken.
   *
   * @param sessionId The sessionId for this device.
   * @param callback The callback(err, json) to return data to the user.
   */
  auth.getAccessToken = function(sessionId, callback) {
    var missingProperties = [];
    if (!sessionId) {
      missingProperties.push("sessionId");
    }

    if (missingProperties.length > 0) {
      callback(error("MissingParams",
          "The following parameters were missing or empty strings: " + missingProperties.join(", "), 400));
      return;
    }

    if (sessionIds.indexOf(sessionId) == -1 ||
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sessionId)) {
      callback(error('InvalidSessionId', 'The provided sessionId was invalid.', 401));
      return;
    }

    if (!(sessionId in sessionIdToRefreshToken)) {
      callback(error('InvalidSessionId', 'The provided sessionId is not ready to use.', 401));
      return;
    }

    var refreshToken = sessionIdToRefreshToken[sessionId];

    var options = getLwaPostOptions('/auth/o2/token');
    var reqGrant = 'grant_type=refresh_token' +
        '&refresh_token=' + refreshToken +
        '&client_id=' + config.clientId +
        '&client_secret=' + config.clientSecret;

    var req = https.request(options, function(res) {
      var resultBuffer = null;

      res.on('end', function() {
        if (res.statusCode === 200 && resultBuffer !== null) {
          var result = JSON.parse(resultBuffer);

          // Craft the response to the device
          var reply = {
            access_token: result.access_token,
            expires_in: result.expires_in
          };
          callback(null, reply);
        }
        else {
          callback(error('TokenRetrievalFailure', 'Unexpected failure while retrieving tokens.', res.statusCode));
        }
      });

      res.on('data', function(data) {
        if (res.statusCode === 200) {
          if (resultBuffer === null) {
            resultBuffer = data;
          }
          else {
            resultBuffer = Buffer.concat([resultBuffer, data]);
          }
        }
        else {
          callback(error('TokenRetrievalFailure', 'Unexpected failure while retrieving tokens.', res.statusCode));
        }
      });
    });

    req.on('error', function(e) {
      callback(error('TokenRetrievalFailure', 'Unexpected failure while retrieving tokens.', 500));
    });

    req.write(reqGrant);
    req.end();
  };

  /**
   * Redirects the user to the LWA login page to enter their username and password.
   *
   * @param regCode The registration code that was presented to the user and maps their request to the device that generated the registration code.
   * @param res The HTTP response object.
   * @param callback The callback(err, json) to return data to the user.
   */
  auth.register = function(regCode, res, callback) {
    if (regCode.length != REG_NUM_BYTES * 2 || !(regCode in regCodeToSessionId)) {
      callback(error('InvalidRegistrationCode', 'The provided registration code was invalid.', 401));
      return;
    }
    else {
      var sessionId = regCodeToSessionId[regCode];
      var prodInfo = sessionIdToDeviceInfo[sessionId];
      redirectToDeviceAuthenticate(prodInfo, regCode, res);
    }
  };

  /**
   * Performs the initial request for refreshToken after the user has logged in and redirected to /authresponse.
   *
   * @param authCode The authorization code that was included in the redirect from LWA.
   * @param stateCode The state code that we use to map a redirect from LWA back to device information.
   * @param callback The callback(err, json) to return data to the user.
   */
  auth.authresponse = function(authCode, stateCode, callback) {
    var missingProperties = [];
    if (!authCode) {
      missingProperties.push("code");
    }

    if (!stateCode) {
      missingProperties.push("state");
    }

    if (missingProperties.length > 0) {
      callback(error("MissingParams",
          "The following parameters were missing or empty strings: " + missingProperties.join(", "), 400));
      return;
    }

    if (!(stateCode in pendingStateToRegCode) || !UUID_REGEX.test(stateCode)) {
      callback(error('InvalidStateCode', 'The provided state code was invalid.', 401));
      return;
    }

    var regCode = pendingStateToRegCode[stateCode];
    var sessionId = regCodeToSessionId[regCode];

    var options = getLwaPostOptions('/auth/o2/token');
    var reqGrant = 'grant_type=authorization_code' +
        '&code=' + authCode +
        '&redirect_uri=' + config.redirectUrl +
        '&client_id=' + config.clientId +
        '&client_secret=' + config.clientSecret;

    var req = https.request(options, function(res) {
      var resultBuffer = null;

      res.on('end', function() {
        if (res.statusCode === 200 && resultBuffer !== null) {
          var result = JSON.parse(resultBuffer);

          sessionIdToRefreshToken[sessionId] = result.refresh_token;
          callback(null, "device tokens ready");
        }
        else {
          callback(error('TokenRetrievalFailure', 'Unexpected failure while retrieving tokens.', res.statusCode));
        }
      });

      res.on('data', function(data) {
        if (res.statusCode === 200) {
          if (resultBuffer === null) {
            resultBuffer = data;
          }
          else {
            resultBuffer = Buffer.concat([resultBuffer, data]);
          }
        }
        else {
          callback(error('TokenRetrievalFailure', 'Unexpected failure while retrieving tokens.', res.statusCode));
        }
      });
    });

    req.on('error', function(e) {
      console.error('Failed to post request: ' + e.message);
    });

    req.write(reqGrant);
    req.end();
  };

  return auth;
}

module.exports = buildAlexaAuthentication;
