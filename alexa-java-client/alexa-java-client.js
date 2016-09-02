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
  const childProcess = require('child_process');
  const java = require('java');
  const fs = require('fs');

  var self = this;
  self.isBooted = false;
  self.magicMirror = undefined;
  self.nodeHelper = undefined;
  self.boot = boot;
  self.deviceRegistered = deviceRegistered;
  self.triggerAlexa = triggerAlexa;

  function boot(nodeHelper) {
    self.nodeHelper = nodeHelper;
    var config = self.nodeHelper.config;

    childProcess.exec(
        'mvn compile dependency:copy-dependencies -f ' + __dirname + '/pom.xml -Dalpn-boot.version=' +
        config.client.alpnVersion, function(error, stdout, stderr) {
          if (error) {
            console.error('Unable to compile Alexa Java Client: ' + error);
            return;
          }

          _initJava(config.client);
          _buildDeviceConfig(config).then(function(deviceConfig) {
            _buildVoicePatternConfig(config).then(function(voiceConfig) {
              var magicMirrorProxy = java.newProxy('com.whyjustin.magicmirror.alexa.MagicMirrorProxy', {
                handleRegistrationCode: function(code) {
                  self.nodeHelper.handleRegistrationCode(code);
                },
                handleToken: function(token) {
                  self.nodeHelper.handleToken(token);
                },
                handleCommand: function(command) {
                  self.nodeHelper.handleCommand(command);
                },
                handleAlexaCompleted: function() {
                  _listen();
                }
              });

              java.newInstance('com.whyjustin.magicmirror.alexa.MagicMirror', deviceConfig, voiceConfig,
                  magicMirrorProxy, function(error, magicMirror) {
                    if (error) {
                      console.error('Unable to run Alexa Java Client:' + error);
                      return;
                    }

                    self.isBooted = true;
                    self.magicMirror = magicMirror;

                    _listen();
                  });
            })
          }).catch(function(error) {
            console.error('Unable to run Alexa Java Client: ' + error);
          });

        });
  }

  function deviceRegistered() {
    if (!self.isBooted) {
      console.error('Must boot client via boot(nodeHelper) before accessing');
      return;
    }

    java.callMethod(self.magicMirror, 'registerDevice', function(error) {
      if (error) {
        console.error('Unable to run register device with Alexa Java Client:' + error);
        return;
      }
    });
  }

  function triggerAlexa() {
    java.callMethod(self.magicMirror, 'triggerAlexa', function(error) {
      if (error) {
        console.error('Unable to run trigger Alexa in Alexa Java Client:' + error);
        return;
      }
    });
  }

  function _initJava(config) {
    process.env['VLC_PATH'] = config.vlcPath;
    process.env['VLC_PLUGIN_PATH'] = config.vlcPluginPath;

    java.options.push(
        '-Xbootclasspath/p:' + __dirname + '/target/dependency/alpn-boot-' + config.alpnVersion + '.jar');
    java.options.push('-Djna.library.path=' + config.vlcPath);
    java.options.push('-Xrs');

    if (config.debug) {
      java.options.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005');
    }

    const baseDir = __dirname + '/target/dependency';
    const dependencies = fs.readdirSync(baseDir);
    dependencies.forEach(function(dependency) {
      java.classpath.push(baseDir + "/" + dependency);
    });

    java.classpath.push(__dirname + '/target/classes');
  }

  function _buildDeviceConfig(config) {
    return new Promise(function(resolve, reject) {
      java.newInstance('com.amazon.alexa.avs.config.CompanionServiceInformation', config.companion.serviceUrl,
          config.ssl.sslClientKeyStore, config.ssl.sslClientKeyStorePassphrase, config.ssl.sslCaCert,
          function(error, companionService) {
            if (error) {
              reject(error);
              return;
            }

            java.newInstance('com.amazon.alexa.avs.config.DeviceConfig', config.alexa.productId,
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

  function _buildVoicePatternConfig(config) {
    return new Promise(function(resolve, reject) {
      java.newInstance('com.whyjustin.magicmirror.alexa.VoicePatternConfig', config.commands.dictionary,
          config.commands.model, function(error, voiceConfig) {
            if (error) {
              reject(error);
              return;
            }

            resolve(voiceConfig);
          })
    });
  }

  function _listen() {
    java.callMethod(self.magicMirror, 'listen', function(error) {
      if (error) {
        console.error('Unable to run trigger Alexa in Alexa Java Client:' + error);
        return;
      }
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
