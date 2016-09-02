{
  alexa: {
    productId: 'my_device',
    dns: '123456'
  },
  alexaCompanion: {
    port: 5555, // Magic Mirror uses a few default ports. Make sure not to conflict with there.
    clientId: '',
    clientSecret: '',
    redirectUrl: 'https://localhost:5555/authresponse',
    lwaRedirectHost: 'amazon.com',
    lwaApiHost: 'api.amazon.com',
    validateCertChain: true,
    sslKey: '/home/pi/Desktop/alexa-avs-raspberry-pi-master/samples/javaclient/certs/server/node.key',
    sslCert: '/home/pi/Desktop/alexa-avs-raspberry-pi-master/samples/javaclient/certs/server/node.crt',
    sslCaCert: '/home/pi/Desktop/alexa-avs-raspberry-pi-master/samples/javaclient/certs/ca/ca.crt'
  },
  alexaClient: {
    alpnVersion: '8.1.6.v20151105', // Tied to Java version, available https://www.eclipse.org/jetty/documentation/9.3.x/alpn-chapter.html#alpn-versions
    vlcPath: ''
  }
}
