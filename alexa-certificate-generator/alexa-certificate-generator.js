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
function alexaCertificateGenerator(config) {
  const Promise = require('bluebird');

  const certsDirectory = __dirname + '/certs';

  return new Promise(function(resolve, reject) {
    var needsGeneration = false;

    config.ssl = config.ssl || {};

    // Generate and replace ssl configuration unless all ssl configuration is supplied
    if (config.ssl.sslCaCert && config.ssl.sslKey && config.ssl.sslCert && config.ssl.sslClientKeyStore) {
      resolve();
      return;
    }

    const fs = require('fs');

    fs.access(certsDirectory + '/ca/ca.crt', function(err) {
      if (err) {
        needsGeneration = true;
      }

      fs.access(certsDirectory + '/server/node.key', function(err) {
        if (err) {
          needsGeneration = true;
        }

        fs.access(certsDirectory + '/server/node.crt', function(err) {
          if (err) {
            needsGeneration = true;
          }

          fs.access(certsDirectory + '/client/client.pkcs12', function(err) {
            if (err) {
              needsGeneration = true;
            }

            config.ssl.sslClientKeyStorePassphrase = config.ssl.sslClientKeyStorePassphrase || '';

            if (!needsGeneration) {
              config.ssl.sslCaCert = certsDirectory + '/ca/ca.crt';
              config.ssl.sslKey = certsDirectory + '/server/node.key';
              config.ssl.sslCert = certsDirectory + '/server/node.crt';
              config.ssl.sslClientKeyStore = certsDirectory + '/client/client.pkcs12';

              resolve();
              return;
            }

            const childProcess = require('child_process');

            process.env['productId'] = config.alexa.productId;
            process.env['dsn'] = config.alexa.dsn;
            process.env['password'] = config.ssl.sslClientKeyStorePassphrase;

            childProcess.exec(__dirname + '/generate.sh', function(error, stdout, stderr) {
              if (error) {
                console.error('Unable to generate Alexa certificates: ' + error);
                reject(error);
                return;
              }

              config.ssl.sslCaCert = certsDirectory + '/ca/ca.crt';
              config.ssl.sslKey = certsDirectory + '/server/node.key';
              config.ssl.sslCert = certsDirectory + '/server/node.crt';
              config.ssl.sslClientKeyStore = certsDirectory + '/client/client.pkcs12';

              resolve();
            });
          });
        });
      });
    });
  });
}

module.exports = {
  generate: alexaCertificateGenerator
};
