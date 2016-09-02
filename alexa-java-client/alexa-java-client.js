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
 */
function AlexaJavaClient() {
  const Promise = require("bluebird");
  const alexaCompanionService = require('../alexa-companion-service/alexa-companion-service');

  var self = this;
  self.java = undefined;
  self.isBooted = false;
  self.alexaClient = undefined;
  self.boot = boot;
  self.deviceRegistered = deviceRegistered;
  self.triggerAlexa = triggerAlexa;

  function boot(java, config, proxy) {
    self.java = java;
    alexaCompanionService(config).then(function() {
      _buildAlexConfig(config).then(function(alexaConfig) {
        var alexaProxy = self.java.newProxy('com.whyjustin.magicmirror.alexa.AlexaProxy', proxy);

        self.java.newInstance('com.whyjustin.magicmirror.alexa.AlexaClient', alexaConfig, alexaProxy,
            function(error, alexaClient) {
              if (error) {
                console.error('Unable to run Alexa Java Client:' + error);
                return;
              }

              self.isBooted = true;
              self.alexaClient = alexaClient;
            });
      })
    }).catch(function(error) {
      console.error('Unable to run Alexa Java Client: ' + error);
    });
  }

  function deviceRegistered() {
    if (!self.isBooted) {
      console.error('Must boot client via boot(config, proxy) before accessing');
      return;
    }

    self.java.callMethod(self.alexaClient, 'registerDevice', function(error) {
      if (error) {
        console.error('Unable to run register device with Alexa Java Client:' + error);
        return;
      }
    });
  }

  function triggerAlexa() {
    if (!self.isBooted) {
      console.error('Must boot client via boot(config, proxy) before accessing');
      return;
    }

    self.java.callMethod(self.alexaClient, 'triggerAlexa', function(error) {
      if (error) {
        console.error('Unable to run trigger Alexa in Alexa Java Client:' + error);
        return;
      }
    });
  }

  function _buildAlexConfig(config) {
    return new Promise(function(resolve, reject) {
      self.java.newInstance('com.whyjustin.magicmirror.alexa.CompanionServiceInformation', config.companion.serviceUrl,
          config.ssl.sslClientKeyStore, config.ssl.sslClientKeyStorePassphrase, config.ssl.sslCaCert,
          function(error, companionService) {
            if (error) {
              reject(error);
              return;
            }

            self.java.newInstance('com.whyjustin.magicmirror.alexa.AlexaConfig', config.alexa.productId,
                config.alexa.dsn, companionService, function(error, deviceConfig) {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(deviceConfig);
                });
          });
    });
  }
}

var alexaJavaClient;
module.exports = {
  get: function() {
    if (!alexaJavaClient) {
      alexaJavaClient = new AlexaJavaClient();
    }
    return alexaJavaClient;
  }
};
