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
function bootstrapJava(config) {
  const Promise = require('bluebird');
  const java = require('java');
  const fs = require('fs');
  const alexaCertificateGenerator = require('./alexa-certificate-generator/alexa-certificate-generator');
  const sphinxModelGenerator = require('./sphinx-model-generator/sphinx-model-generator');

  return new Promise(function(resolve, reject) {
    alexaCertificateGenerator.generate(config).then(function() {
      sphinxModelGenerator.generate(config).then(function() {
        fs.access(__dirname + '/java-client/target/', function(err) {
          if (err || config.debug) {
            const childProcess = require('child_process');

            childProcess.exec(
                'mvn compile dependency:copy-dependencies -f ' + __dirname +
                '/java-client/pom.xml -Dalpn-boot.version=' +
                config.client.alpnVersion, {
                  maxBuffer: 1024 * 1000
                },
                function(error, stdout, stderr) {
                  if (error) {
                    console.error('Unable to compile Alexa Java Client: ' + error);
                    reject(error);
                    return;
                  }

                  _buildJVM();
                  resolve(java);
                });
            return;
          }

          _buildJVM();
          resolve(java);
        });
      });
    });
  });

  function _buildJVM() {
    process.env['VLC_PATH'] = config.client.vlcPath;
    process.env['VLC_PLUGIN_PATH'] = config.client.vlcPluginPath;

    java.options.push(
        '-Xbootclasspath/p:' + __dirname + '/java-client/target/dependency/alpn-boot-' +
        config.client.alpnVersion +
        '.jar');
    java.options.push('-Djna.library.path=' + config.client.vlcPath);
    java.options.push('-Xrs');

    if (config.debug) {
      java.options.push('-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005');
    }

    const baseDir = __dirname + '/java-client/target/dependency';
    const dependencies = fs.readdirSync(baseDir);
    dependencies.forEach(function(dependency) {
      java.classpath.push(baseDir + "/" + dependency);
    });

    java.classpath.push(__dirname + '/java-client/target/classes');
  }
}

module.exports = bootstrapJava;
