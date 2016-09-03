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
function SphinxJavaClient() {
  var self = this;
  self.java = undefined;
  self.isBooted = false;
  self.sphinxClient = undefined;
  self.boot = boot;
  self.listen = listen;
  self.stop = stop;
  self.isListening = isListening;

  function boot(java, config, proxy) {
    self.java = java;
    return new Promise(function(resolve, reject) {
      _buildSphinxConfig(config).then(function(sphinxConfig) {
        var sphinxProxy = java.newProxy('com.whyjustin.magicmirror.sphinx.SphinxProxy', proxy);

        self.java.newInstance('com.whyjustin.magicmirror.sphinx.SphinxClient', sphinxConfig, sphinxProxy,
            function(error, sphinxClient) {
              if (error) {
                console.error('Unable to run Sphinx Java Client:' + error);
                return;
              }

              self.isBooted = true;
              self.sphinxClient = sphinxClient;

              resolve();
            });
      }).catch(function(error) {
        console.error('Unable to run Sphinx Java Client: ' + error);
        reject(error);
      });
    });
  }

  function listen() {
    if (!self.isBooted) {
      console.error('Must boot client via boot(config, proxy) before accessing');
      return;
    }

    console.trace('Listen Triggered');
    self.java.callMethod(self.sphinxClient, 'listen', function(error) {
      if (error) {
        console.error('Unable to run Listen in Sphinx Java Client:' + error);
        return;
      }
    });
  }

  function stop() {
    if (!self.isBooted) {
      console.error('Must boot client via boot(config, proxy) before accessing');
      return;
    }

    self.java.callMethod(self.sphinxClient, 'stop', function(error) {
      if (error) {
        console.error('Unable to run Stop in Sphinx Java Client:' + error);
        return;
      }
    });
  }

  function isListening() {
    return new Promise(function(resolve, reject) {
      if (!self.isBooted) {
        console.error('Must boot client via boot(config, proxy) before accessing');
        reject();
      }

      self.java.callMethod(self.sphinxClient, 'isListening', function(error, isListening) {
        if (error) {
          console.error('Unable to run Stop in Sphinx Java Client:' + error);
          reject();
        }
        resolve(isListening);
      });
    });
  }

  function _buildSphinxConfig(config) {
    return new Promise(function(resolve, reject) {
      self.java.newInstance('com.whyjustin.magicmirror.sphinx.SphinxConfig', config.sphinx.dictionary,
          config.sphinx.model, function(error, sphinxConfig) {
            if (error) {
              reject(error);
              return;
            }

            resolve(sphinxConfig);
          });
    });
  }
}

var sphinxJavaClient;
module.exports = {
  get: function() {
    if (!sphinxJavaClient) {
      sphinxJavaClient = new SphinxJavaClient();
    }
    return sphinxJavaClient;
  }
};
