## Installation

A good deal of the installation is bootstrapped in the run process. This causes a long load time in favor of less
configuration. There are a few steps that are required to get started, many similar to those required to configure
Alexa for the Raspberry Pi.

* Install VLC (https://github.com/alexa/alexa-avs-raspberry-pi#23---install-vlc)
    * Environmental variables do not need to be configured as they are pulled from this modules JSON config   
* Install JDK (https://github.com/alexa/alexa-avs-raspberry-pi#43---install-java-development-kit)
    * ALPN version must be set in this modules JSON config
* Install Maven (https://github.com/alexa/alexa-avs-raspberry-pi#44---install-maven)
* Register and configure Alexa Voice Service (https://github.com/alexa/alexa-avs-raspberry-pi#6---getting-started-with-alexa-voice-service)

Once complete, fill in the required configuration JSON fields and run npm install from the module directory.

## Installation Notes

Electron is not always using the same version of node as installed on your device. npm install will compile native
modules to the global version of node which may cause issues when running in electron. If you are using the electron
version (this is the default) of Magic Mirror, this will cause issues.

**NOTE: The following instructions are arguably more difficult that running Magic Mirror in serveronly mode and
displaying the mirror in a full screen browser.**

There is a work around, but pending a resolution to [Issue #344](https://github.com/joeferner/node-java/issues/344), 
this involves downgrading Magic Mirror's Electron client to 1.2.8 by adjusting the package.json and reinstalling npm 
dependencies. After doing so, and installing the Magic Mirror Voice dependencies, running the following will clear up 
any errors. From the Magic Mirror home directory:

```
sed -i 's/"electron-prebuilt": "latest"/"electron-prebuilt": "1.2.8"/g' package.json
npm install
cd modules/magic-mirror-voice
npm install
./node_modules/.bin/electron-rebuild -v=1.2.8 
```

Hopefully the team at node-java will issue a fix to prevent the need to downgrade Electron, the rebuild will still be
necessary.

## Configuration

This module relies heavily on the work done by Amazon to get Alexa Voice Services working on the Raspberry Pi.  

## Sample Configuration

The following should go within the modules array of your config/config.json file.

```
{
  module: 'magic-mirror-voice',
  header: 'Magic Mirror Voice',
  position: 'top_right',
  config: {
    debug: true, // Optional
    alexa: {
      productId: 'productId',
      dsn: 'dsn'
    },
    ssl: {
      sslCaCert: './magic-mirror-voice/alexa-certificate-generator/certs/ca/ca.crt', // Optional
      sslKey: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.key', // Optional
      sslCert: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.crt', // Optional
      sslClientKeyStore: './magic-mirror-voice/alexa-certificate-generator/certs/client/client.pkcs12', // Optional
      sslClientKeyStorePassphrase: ''
    },
    companion: {
      port: 5555,
      serviceUrl: 'https://localhost:5555',
      redirectUrl: 'https://localhost:5555/authresponse',
      clientId: 'clientId',
      clientSecret: 'clientSecret'
    },
    client: {
      alpnVersion: '8.1.6.v20151105',
      vlcPath: '/Applications/VLC.app/Contents/MacOS/lib',
      vlcPluginPath: '/Applications/VLC.app/Contents/MacOS/plugins'
    },
    sphinx: {
      commands: {
        "mirror mirror": {
          action: 'alexa'
        }
      },
      dictionary: './commands.dic', // Optional
      model: './commands.lm' // Optional
    }
  }
}
```
