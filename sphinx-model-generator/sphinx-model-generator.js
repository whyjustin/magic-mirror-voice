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
const Promise = require("bluebird");
const lmtool = require('lmtool');
const fs = require('fs');

function sphinxModelGenerator(config) {
  return new Promise(function(resolve, reject) {
    var needsGeneration = false;
    fs.access(__dirname + '/commands.dic', function(err) {
      if (err) {
        needsGeneration = true;
      }
      fs.access(__dirname + '/commands.lm', function(err) {
        if (err) {
          needsGeneration = true;
        }
        fs.readFile(__dirname + '/cached.json', function(err, data) {
          var cachedConfig = data ? JSON.parse(data) : '';
          if (cachedConfig !== config.sphinx.commands) {
            needsGeneration = true;
            fs.writeFileSync(__dirname + '/cached.json', JSON.stringify(config.sphinx.commands));
          }

          _buildSphinxConfiguration(config).then(function() {
            if (!needsGeneration) {
              resolve();
              return;
            }
            _generateLanguageModel(config).then(function() {
              resolve();
            });
          }).catch(function(error) {
            reject(error);
          });
        });
      });
    });
  });
}

/**
 * Generate a language model for the desired Magic Mirror commands. This will be used by Sphinx to only try
 * to recognize words from this dictionary.
 */
function _generateLanguageModel(config) {
  return new Promise(function(resolve) {
    var dictionary = [];
    for (var key in config.sphinx.commands) {
      if (config.sphinx.commands.hasOwnProperty(key)) {
        dictionary.push(key);
      }
    }

    lmtool(dictionary, function(err, filename) {
      fs.renameSync(filename + '.dic', __dirname + '/commands.dic');
      fs.renameSync(filename + '.lm', __dirname + '/commands.lm');

      fs.unlink(filename + '.log_pronounce');
      fs.unlink(filename + '.sent');
      fs.unlink(filename + '.vocab');
      fs.unlink('TAR' + filename + '.tgz');

      config.sphinx.dictionary = __dirname + '/commands.dic';
      config.sphinx.model = __dirname + '/commands.lm';
      resolve();
    });
  })
}

/**
 * Generate a Sphinx Configuration file with appropriate logLevel
 */
function _buildSphinxConfiguration(config) {
  return new Promise(function(resolve, reject) {
    if (!config.sphinx.configuration) {
      const configuration = __dirname + '/config.xml';
      var logLevel = config.sphinx.logLevel || 'WARNING';

      var xml = '<?xml version="1.0"?><config><property name="logLevel" value="' + logLevel + '"/></config>';
      fs.writeFile(configuration, xml, function(error) {
        if (error) {
          reject(error);
          return;
        }

        config.sphinx.configuration = configuration;
        resolve();
      });
    }
  });
}

module.exports = {
  generate: sphinxModelGenerator
};
