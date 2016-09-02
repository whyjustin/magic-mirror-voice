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
const Promise = require("bluebird");
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const alexaJavaClient = require('../alexa-java-client/alexa-java-client');

function createServer(config) {
  // Prevent redundant configuration by building expected configuration from normalized configuration
  var companionConfig = {
    clientId: config.companion.clientId,
    clientSecret: config.companion.clientSecret,
    port: config.companion.port,
    redirectUrl: config.companion.redirectUrl,
    lwaRedirectHost: 'amazon.com',
    lwaApiHost: 'api.amazon.com',
    validateCertChain: true,
    sslKey: config.ssl.sslKey,
    sslCert: config.ssl.sslCert,
    sslCaCert: config.ssl.sslCaCert,
    products: {}
  };
  companionConfig.products[config.alexa.productId] = config.alexa.dsn;

  return new Promise(function(resolve, reject) {
    var app = createExpressApp(companionConfig);
    handleSslCerts(app, companionConfig);
    resolve();
  });
}

function createExpressApp(config) {
  const auth = require('./alexa-authentication')(config);

  var app = express();
  app.use(bodyParser.json());

  /**
   * The endpoint for the device to request a registration code to then show to the user.
   */
  app.get('/provision/regCode', function(req, res) {
    if (!req.client.authorized) {
      res.status(401);
      res.send({
        error: "Unauthorized",
        message: "You are not authorized to access this URL. Make sure your client certificate is set up properly."
      });
      return;
    }

    auth.getRegCode(req.query.productId, req.query.dsn, function(err, reply) {
      if (err) {
        res.status(err.status);
        res.send({error: err.name, message: err.message});
      }
      else {
        res.send(reply);
      }
    });
  });

  /**
   * The endpoint for the device to request a new accessToken when the previous one expires.
   */
  app.get('/provision/accessToken', function(req, res) {
    if (!req.client.authorized) {
      res.status(401);
      res.send({
        error: "Unauthorized",
        message: "You are not authorized to access this URL. Make sure your client certificate is set up properly."
      });
      return;
    }

    auth.getAccessToken(req.query.sessionId, function(err, reply) {
      if (err) {
        res.status(err.status);
        res.send({error: err.name, message: err.message});
      }
      else {
        res.send(reply);
      }
    });
  });

  /**
   * The endpoint for the customer to visit and get redirected to LWA to login.
   */
  app.get('/provision/:regCode', function(req, res, next) {
    auth.register(req.params.regCode, res, function(err) {
      // on success gets redirect so wont return to a callback.
      res.status(err.status);
      res.send({error: err.name, message: err.message});

      next(err);
    });
  });

  /**
   * The endpoint that LWA will redirect to to include the authorization code and state code.
   */
  app.get('/authresponse', function(req, res) {
    auth.authresponse(req.query.code, req.query.state, function(err, reply) {
      if (err) {
        res.status(err.status);
        res.send({error: err.name, message: err.message});
      }
      else {
        var javaClient = alexaJavaClient.get();
        javaClient.deviceRegistered();

        res.send(reply);
      }
    });
  });

  // standard error handling functions.
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function(err, req, res, next) {
    console.error("Error with Alexa Companion Service: ", err);
    res.status(err.status || 500);
    res.send('error: ' + err.message);
  });

  return app;
}

function handleSslCerts(app, config) {
  /**
   * Get port from environment and store in Express.
   */
  var port = normalizePort(config.port);
  app.set('port', port);

  var options = {
    key: fs.readFileSync(config.sslKey),
    cert: fs.readFileSync(config.sslCert),
    ca: fs.readFileSync(config.sslCaCert),
    requestCert: true,
    rejectUnauthorized: false
  };

  /**
   * Create HTTP server.
   */
  var server = https.createServer(options, app);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
}

module.exports = createServer;
