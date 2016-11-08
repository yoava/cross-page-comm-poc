$(function () {
    "use strict";

    var header = $('#header');
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var myName = false;
    var author = null;
    var logged = false;
    var socket = atmosphere;
    var subSocket;
    // We are now ready to cut the request
    var request = {
        url: '/hermy/socket/aaa',
        // enableProtocol:false,
        contentType: "application/json",
        logLevel: 'debug',
        transport: 'websocket',
        trackMessageLength: true,
        reconnectInterval: 5000
    };

    request.onOpen = function (response) {
        content.html($('<p>', {
            text: 'Atmosphere connected using ' + response.transport
        }));
        input.removeAttr('disabled').focus();
        status.text('Choose name:');

        // Carry the UUID. This is required if you want to call
        // subscribe(request) again.
        // request.uuid = response.request.uuid;
    };

    request.onClientTimeout = function (r) {
        content
            .html($(
                '<p>',
                {
                    text: 'Client closed the connection after a timeout. Reconnecting in '
                    + request.reconnectInterval
                }));
        subSocket
            .push(atmosphere.util
                .stringifyJSON({
                    author: author,
                    message: 'is inactive and closed the connection. Will reconnect in '
                    + request.reconnectInterval
                }));
        input.attr('disabled', 'disabled');
        setTimeout(function () {
            subSocket = socket.subscribe(request);
        }, request.reconnectInterval);
    };

    request.onReopen = function (response) {
        input.removeAttr('disabled').focus();
        content.html($('<p>', {
            text: 'Atmosphere re-connected using ' + response.transport
        }));
    };

    // For demonstration of how you can customize the fallbackTransport using
    // the onTransportFailure function
    request.onTransportFailure = function (errorMsg, request) {
        atmosphere.util.info(errorMsg);
        request.fallbackTransport = "long-polling";
        header
            .html($(
                '<h3>',
                {
                    text: 'Atmosphere Chat. Default transport is WebSocket, fallback is '
                    + request.fallbackTransport
                }));
    };

    request.onMessage = function (response) {

        var message = response.responseBody;
        try {
            var json = atmosphere.util.parseJSON(message);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message);
            return;
        }
        if (json.message == 'connect') {
            request.onOpen({})
        }

        input.removeAttr('disabled').focus();
        if (!logged && myName) {
            logged = true;
            status.text(myName + ': ').css('color', 'blue');
        } else {
            var me = json.author == author;
            var date = typeof (json.time) == 'string' ? parseInt(json.time)
                : json.time;
            addMessage(json.author, json.message, me ? 'blue' : 'black',
                new Date(date));
        }
    };

    request.onClose = function (response) {
        content.html($('<p>', {
            text: 'Server closed the connection after a timeout'
        }));
        if (subSocket) {
            subSocket.push(atmosphere.util.stringifyJSON({
                author: author,
                message: 'disconnecting'
            }));
        }
        input.attr('disabled', 'disabled');
    };

    request.onError = function (response) {
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
            + 'socket or the server is down'
        }));
        logged = false;
    };

    request.onReconnect = function (request, response) {
        content.html($('<p>', {
            text: 'Connection lost, trying to reconnect. Trying to reconnect '
            + request.reconnectInterval
        }));
        input.attr('disabled', 'disabled');
    };

    subSocket = socket.subscribe(request);

    input.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();

            // First message is always the author's name
            if (author == null) {
                author = msg;
            }

            subSocket.push(atmosphere.util.stringifyJSON({
                author: author,
                message: msg
            }));
            $(this).val('');

            input.attr('disabled', 'disabled');
            if (myName === false) {
                myName = msg;
            }
        }
    });

    function addMessage(author, message, color, datetime) {
        content.append('<p><span style="color:'
            + color
            + '">'
            + author
            + '</span> @ '
            + +(datetime.getHours() < 10 ? '0' + datetime.getHours()
                : datetime.getHours())
            + ':'
            + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes()
                : datetime.getMinutes()) + ': ' + message + '</p>');
    }


    request.callback = function (e) {
        console.info('callback', e)
    };

    var ie5win;
    window.openIE5 = function () {
        if (!ie5win || ie5win.closed) {
            ie5win = window.open('example-ie7.html', 'ie5');
        } else {
            alert('already opened!')
        }
    }
});


