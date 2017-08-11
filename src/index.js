var React = require('react');
var FluxUtils = require('flux/utils');
var Dispatcher = require('flux').Dispatcher;
var transit = require('transit-immutable-js');
var createElement = React.createElement;
var Container = FluxUtils.Container;
var STORE_KEY = '__NEXT_FLUX_STORE__';
var SKIP_PROPERTIES = ['initialState', 'initialProps', 'isServer'];
var _Promise;
var _debug = false;
var isBrowser = typeof window !== 'undefined';

function initStore(getStores, context) {
    var req = context.req;
    var isServer = context.isServer;
    var dispatcher;
    // Always make a new store if server
    if (isServer) {
        if (!req._stores) {
            dispatcher = new Dispatcher();
            req._stores = getStores().map(function(store) {
                return new store.constructor(dispatcher);
            });
        }
        return req._stores;
    }

    if (!isBrowser) {
        return null;
    }

    // Memoize store if client
    if (!window[STORE_KEY]) {
        window[STORE_KEY] = getStores();
    }

    return window[STORE_KEY];
}

module.exports = function withFlux(Base) {
    var getStores = Base.getStores.bind(Base);
    var ContainerClass = Container.create(Base);

    function WrapperClass(props) {
        props = props || {};
        var initialProps = props.initialProps || {};
        var initialState = props.initialState || [];
        var stores = Base.getStores();
        var mergedProps = {};

        if (_debug) {
            console.log(Base.name, '- 3. WrappedClass.render', 'initialState', initialState);
        }

        // I think It is not safe but I don't have any alternative
        initialState.forEach(function(state, index) {
            stores[index]._state = transit.fromJSON(state);
        });

        if (_debug) {
            console.log(Base.name, '- 4. WrappedClass.render', 'unserialize state', stores);
        }

        // Filter unnecessary properties at the client level
        Object.keys(props).forEach(function(prop) {
            if (SKIP_PROPERTIES.indexOf(prop) === -1) {
                mergedProps[prop] = props[prop];
            }
        });

        Object.keys(initialProps).forEach(function(prop) {
            mergedProps[prop] = initialProps[prop]
        });

        return createElement(ContainerClass, mergedProps);
    }

    WrapperClass.getInitialProps = function(context) {
        return new _Promise(function(resolve) {
            context = context || {};
            context.isServer = !!context.req && !isBrowser;
            context.stores = (Base.getStores = function() {return initStore(getStores, context)})();
            context.dispatch = context.stores[0].__dispatcher.dispatch.bind(context.stores[0].__dispatcher);

            if (_debug) {
                console.log(Base.name, '- 1. WrappedClass.getInitialProps create stores', context.stores);
            }

            resolve(_Promise.all([
                context.isServer,
                context.stores,
                context.req,
                Base.getInitialProps ? Base.getInitialProps.call(Base, context) : {}
            ]));
        }).then(function(result) {
            var states = result[1].map(function(store) {
                return transit.toJSON(store.getState());
            });

            if (_debug) {
                console.log(Base.name, '- 2. WrappedClass.getInitialProps serialize states', states);
            }

            return {
                isServer: result[0],
                initialState: states,
                initialProps: result[3]
            };
        });
    };

    return WrapperClass;
};

module.exports.setPromise = function(Promise) {
    _Promise = Promise;
};

module.exports.setDebug = function(debug) {
    _debug = debug;
};

module.exports.setPromise(Promise);
