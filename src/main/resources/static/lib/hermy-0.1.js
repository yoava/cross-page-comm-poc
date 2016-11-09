// todo yoava: move to standalone client-side build module

// UMD Module
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'atmosphere'], factory);
    } else if (typeof exports === 'obj¬ect') {
        // Node, CommonJS-like
        module.exports = factory(require('jquery'), require('atmosphere'));
    } else {
        // Browser globals (root is window)
        var HermyClient = factory(root.jQuery, root.atmosphere);
        root.returnExports = HermyClient;
        root.HermyClient = HermyClient;
    }
}(this, function ($, atmosphere) {
    // utils
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function addUrlParam(url, key, value) {
        var newParam = key + "=" + value;
        var result = url.replace(new RegExp("(&|\\?)" + key + "=[^\&|#]*"), '$1' + newParam);
        if (result === url) {
            result = (url.indexOf("?") != -1 ? url.split("?")[0] + "?" + newParam + "&" + url.split("?")[1]
                : (url.indexOf("#") != -1 ? url.split("#")[0] + "?" + newParam + "#" + url.split("#")[1]
                : url + '?' + newParam));
        }
        return result;
    }


    /**
     * Creates a new HermyClient
     * @param options see examples.js
     * @constructor
     */
    function HermyClient(options) {
        var o = options;
        if (typeof o == 'string') {
            // got just tokenSeed
            this.tokenSeed = o;
        } else {
            // got options object
            if (o.transport && o.transport != 'http') {
                throw new Error('transport "' + o.transport + '" is not supported yet');
            }
        }

        // defaults
        this.transport = o.transport || 'http';
        this.socketUrl = o.socketUrl || '/hermy/socket';
        this.cookieName = o.cookieName || 'hermyToken';
        this.tokenSeed = o.tokenSeed || '';
        this.listeners = [];
        this.targets = [];
        this.name = '';

        this.init();
    }

    var p = HermyClient.prototype;

    p.init = function init() {
        // init token
        this.initToken();
    };

    p.initToken = function initToken() {
        // get token from hash or query string
        var match = location.href.match(/\$hermy=([^&?#]*)/);
        if (match && match[1]) {
            this.token = unescape(match[1]);
            createCookie(this.cookieName, this.token, 365);
            return;
        }

        // get token from cookie
        var cookie = readCookie(this.cookieName);
        if (!cookie) {
            this.token = cookie;
            return;
        }

        // generate random token
        this.token = this.tokenSeed
            + new Date().getTime().toString(36)
            + Math.random().toString(36).substr(2);

        createCookie(this.cookieName, this.token, 365);
    };

    p.channel = function channel(name) {
        this.name = name;
        return this;
    };

    p.with = function (target) {
        this.targets.push(target);
        return this;
    };

    p.on = function on(messageType, source, callback) {
        // "fix" params
        if (messageType && source && callback) {
            // on(messageType, source, callback)
        } else if (messageType && source) {
            // on(messageType, callbackFunction)
            callback = source;
            source = null;
        } else if (messageType) {
            // on(callback)
            callback = messageType;
            source = null;
            messageType = null;
        }

        // validate
        if (typeof callback != 'function') {
            throw new Error('Illegal argument, callback is not a function')
        }

        // add listener
        var listeners = this.listeners;
        if (typeof source == 'string' || !source || !source.length) {
            listeners.push({type: messageType, source: source, cb: callback});
        } else {
            $.each(source, function () {
                listeners.push({type: messageType, source: this, cb: callback});
            });
        }
        return this;
    };

    p.off = function off(messageType, callbackFunction) {
        var selector;
        if (messageType && callbackFunction) {
            // off(messageType, callbackFunction)
            selector = function (listener) {
                return listener.cb != callbackFunction && listener.type != messageType;
            };

        } else if (typeof messageType == 'string') {
            // off(messageType)
            selector = function (listener) {
                return listener.type != messageType;
            };
        } else if (typeof messageType == 'function') {
            // off(callbackFunction)
            selector = function (listener) {
                return listener.cb != messageType;
            };

        } else {
            // nop
            return this;
        }

        this.listeners = $(this.listeners).filter(selector);
        return this;
    };

    p.send = function send() {

    };

    p.withHermyQueryParam = function withHermyQueryParam(url) {
        if (url.indexOf('$hermy') >= 0) {
            return url;
        }
        return addUrlParam(url, '$hermy', escape(this.token));
    };

    p.withHermyHash = function withHermyHash(url) {
        if (url.indexOf('$hermy') >= 0) {
            return url;
        }
        return url + '#$hermy=' + escape(this.token);
    };

    p.addAnchorQueryParam = function addAnchorQueryParam(selector) {
        var _this = this;
        $(selector).each(function () {
            if (this.href) {
                this.href = _this.withHermyQueryParam(this.href);
            }
        });
        return this;
    };

    p.addAnchorHash = function addAnchorHash(selector) {
        var _this = this;
        $(selector).each(function () {
            if (this.href) {
                this.href = _this.withHermyHash(this.href);
            }
        });
        return this;
    };

    return HermyClient;
}));