## Installation Notes

Special requirements for [npm java package](https://www.npmjs.com/package/java)

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
