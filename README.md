var magicMirrorVoiceConfig = {
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
      sslCaCert: './magic-mirror-voice/alexa-certificate-generator/certs/ca/ca.crt',
      sslKey: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.key',
      sslCert: './magic-mirror-voice/alexa-certificate-generator/certs/server/node.crt',
      sslClientKeyStore: './magic-mirror-voice/alexa-certificate-generator/certs/client/client.pkcs12',
      sslClientKeyStorePassphrase: ''
    },
    companion: {
      port: 5555,
      serviceUrl: 'https://localhost:5555',
      redirectUrl: 'https://localhost:5555/authresponse',
      clientId: 'clientId',
      clientSecret: 'clientId'
    },
    client: {
      alpnVersion: '8.1.6.v20151105',
      vlcPath: '/Applications/VLC.app/Contents/MacOS/lib',
      vlcPluginPath: '/Applications/VLC.app/Contents/MacOS/plugins'
    },
    sphinx: {
      commands: {
        "mirror mirror": "alexa"
      },
      dictionary: './commands.dic', // Optional
      model: './commands.lm' // Optional
    }
  }
}
