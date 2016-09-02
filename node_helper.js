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
const NodeHelper = require('node_helper');
const bootstrap = require('./magic-mirror-voice-bootstrap');
const alexaJavaClientFactory = require('./alexa-java-client/alexa-java-client');
const sphinxJavaClientFactory = require('./sphinx-java-client/sphinx-java-client');

var isLoaded = false;
var runtime = {
  isLoading: false,
  isRegistered: false,
  registrationCode: undefined,
  registrationUrl: undefined
};
var alexaJavaClient = undefined;
var sphinxJavaClient = undefined;

module.exports = NodeHelper.create({
  socketNotificationReceived: function(notification, payload) {
    var self = this;
    if (notification === 'INIT') {
      self.config = payload;
      runtime.isLoading = true;
      self.sendSocketNotification('UPDATE_DOM', runtime);

      if (!isLoaded) {
        isLoaded = true;

        bootstrap(self.config).then(function(java) {
          alexaJavaClient = alexaJavaClientFactory.get();
          alexaJavaClient.boot(java, self.config, {
            handleRegistrationCode: function(registrationCode) {
              self.handleRegistrationCode(registrationCode);
            },
            handleToken: function(token) {
              self.handleToken(token);
            },
            handleAlexaCompleted: function() {

            }
          });

          sphinxJavaClient = sphinxJavaClientFactory.get();
          sphinxJavaClient.boot(java, self.config, {
            handleCommand: function(command) {
              self.handleCommand(command);
            }
          }).then(function() {
            sphinxJavaClient.listen();
          });

          runtime.isLoading = false;
          self.sendSocketNotification('UPDATE_DOM', runtime);
        });
      }
    }
  },
  handleRegistrationCode: function(registrationCode) {
    var self = this;
    runtime.registrationCode = registrationCode;
    runtime.registrationUrl = self.config.companion.serviceUrl + '/provision/' + runtime.registrationCode;
    console.info('Register Alexa Java Client by navigating to ' + runtime.registrationUrl);
    self.sendSocketNotification('UPDATE_DOM', runtime);
  },
  handleToken: function(token) {
    var self = this;
    runtime.isRegistered = true;
    console.info('Alexa Java Client registered with token: ' + token);
    self.sendSocketNotification('UPDATE_DOM', runtime);
  },
  handleCommand: function(command) {
    var self = this;
    for (var pattern in self.config.commands.patterns) {
      if (self.config.commands.patterns.hasOwnProperty(pattern)) {
        if (pattern.toLowerCase() === command.toLowerCase()) {
          var action = self.config.commands.patterns[pattern];

          if (action === 'alexa') {
            alexaJavaClient.triggerAlexa();
          }
        }
      }
    }
  }
});
