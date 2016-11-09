// HermyClient Config:
////////////////////////////////////////

// A client provides a way to create Hermy channels
var hermyClient = new HermyClient({
    transport: 'http',                  // optional. 'applet','flash' or 'http'. default: 'http'
    socketUrl: '/hermy/socket',         // Hermy Websocket URL (when using HTTP transport). Uses Atmosphere server. default: '/hermy/socket'
    cookieName: 'hermyToken',           // Cookie name for storing token. default: 'hermyToken'
    tokenSeed: 'username'               // it's recommended to create hermy with a unique token seed per user
});

// or you can pass just a token seed
var hermyClient = new HermyClient(tokenSeed);

// A channel provides a way to communicate with other pages.
// Each channel has an identifying name. A channel will typically ignore messages received from sender instances with the same name.
// Each channel will typically communicate with other predefined channels.
// chanel config options:

// create channel
var channel = hermyClient
    .channel(senderName)    // this is the sender name. (e.g. channel('ie7') )
    .with(targetName)       // add a target channel (e.g. with('angular-app')
    .with(target2);


// listen to incoming messages
// callbackFunction receives message and messageDefinition object (messageDefinition contains $type, $body, $to and $from fields)
channel | hermyClient
    .on(messageType, 'sourceName' | ['source1', 'source2'], callbackFunction)  // listen to messages of a given type from given sources
    .on(messageType, callbackFunction)  // listen to messages of a given type (from any source)
    .on(callbackFunction)  // listen to all messages

    // a 'connect' event is received when Hermy connects to server
    .on('connect', function (user, metadata) {
        console.info('Got message from ' + metadata.$from);
        console.info('Showing user #' + user.id);
    })

    // listen example
    .on('showUser', function (user, metadata) {
        console.info('Got message from ' + metadata.$from);
        console.info('Showing user #' + user.id);
    })

    // remove a listener
    .off(messageType, callbackFunction) // remove callbackFunction from type messageType
    .off(messageType)                   // remove all listeners from messageType
    .off(callbackFunction)              // remove callbackFunction from all message types

    // send message
    .send(messageType, messageData) // send a message of type messageType to all targets
    .send('showUser', {id: 100})

    .send(messageObject)    // sends 'message' object to all targets. uses 'message' as default messageType.
    .send({
        age: 1,
        name: 'My name'
    })

    .send(messageDefinition)  // gives more control over targets and message metadata
    .send({
        $type: 'showUser',
        $to: 'targetName' | ['target1', 'target2'], // ignore with() and send message only to these targets
        $body: messageObject // optional. use this body as message instead of entire object
    })

    // send() returns a promise, resolving when message was sent
    .then(function (messageDefinition) {

    });


// Utils
///////////////////////////////////////////////

// Can be accessed using Hermy Client or a Hermy Channel
var hermy = hermyClient | channel;

// get client token
// token is passed to other pages using query parameter, hash or cookie
var hermyToken = hermy.token;

// add Hermy token to a given URL
hermy.withHermyQueryParam('http://server/path?param=value'); // => http://server/path?param=value&hermy=hermyToken
hermy.withHermyHash('http://server/path?param=value'); // => http://server/path?param=value#hermy=hermyToken

// fix an existing <a href="">link</a>. return self to allow chaining
hermy.addAnchorQueryParam(anchorDomElement | querySelector | 'a' | '#someId');
hermy.addAnchorHash('a.cssClass');
