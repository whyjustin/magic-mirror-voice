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
const childProcess = require('child_process');
const java = require('java');
const fs = require('fs');

function bootstrapJava(config) {
  return new Promise(function(resolve, reject) {
    childProcess.exec(
        'mvn compile dependency:copy-dependencies -f ' + __dirname + '/java-client/pom.xml -Dalpn-boot.version=' +
        config.client.alpnVersion, function(error, stdout, stderr) {
          if (error) {
            console.error('Unable to compile Alexa Java Client: ' + error);
            reject(error);
            return;
          }

          process.env['VLC_PATH'] = config.client.vlcPath;
          process.env['VLC_PLUGIN_PATH'] = config.client.vlcPluginPath;

          java.options.push(
              '-Xbootclasspath/p:' + __dirname + '/java-client/target/dependency/alpn-boot-' + config.client.alpnVersion +
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

          resolve(java);
        });
  });
}

module.exports = bootstrapJava;
