## Installation

A good deal of the installation is bootstrapped in the run process. This causes a long load time in favor of less
configuration. By default the only requirement for installation is npm install.

## Installation Notes

Electron is not always using the save version of node as installed on your device. npm install will compile native
modules to the global version of node which may cause issues when running in electron. If you are using the electron
version (this is the default) of Magic Mirror, this will cause issues.

**NOTE: The following instructions are arguably more difficult that running Magic Mirror in serveronly mode and
displaying the mirror in a full screen browser.**

There is a work around, but pending a resolution to https://github.com/joeferner/node-java/issues/344, this involves 
downgrading Magic Mirror's Electron client to 1.2.8 by adjusting the package.json and reinstalling npm dependencies. 
After doing so, and installing the Magic Mirror Voice dependencies, running the following will clear up any errors.

```
./node_modules/.bin/electron-rebuild -v=1.2.8 
```

Hopefully the team at node-java will issue a fix to prevent the need to downgrade Electron, the rebuild will still be
necessary.

## Sample Configuration

```
var magicMirrorVoiceConfig = {
  module: 'magic-mirror-voice',
  header: 'Magic Mirror Voice',
  position: 'top_right',
  config: {
    debug: true,
    alexa: {
      productId: 'productId',
      dsn: 'dsn'
    },
    ssl: {
      sslCaCert: './magic-mirror-voice/alexa-certificate-generator/certs/ca/ca.crt',  // Optional
      sslKey: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.key',  // Optional
      sslCert: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.crt',  // Optional
      sslClientKeyStore: './magic-mirror-voice/alexa-certificate-generator/certs/client/client.pkcs12',  // Optional
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
