var React = require('react');
var FluxUtils = require('flux/utils');
var Immutable = require('immutable');
var createElement = React.createElement;
var Container = FluxUtils.Container;
var fromJS = Immutable.fromJS;
var STORE_KEY = '__NEXT_FLUX_STORE__';
var SKIP_PROPERTIES = ['initialState', 'initialProps', 'isServer', 'store'];
var _Promise;
var _debug = false;

function initStore(getStores, req) {
    // Always make a new store if server
    if (!!req && typeof window === 'undefined') {
        if (!req._stores) {
            req._stores = getStores();
        }
        return req._stores;
    }

    // Memoize store if client
    if (!window[STORE_KEY]) {
        window[STORE_KEY] = getStores();
    }

    return window[STORE_KEY];
}

module.exports = function withFlux(Base) {
    var ContainerClass = Container.create(Base);

    function WrapperClass(props) {
        props = props || {};

        var initialProps = props.initialProps || {};
        var initialState = props.initialState || [];
        var stores = initStore(Base.getStores, {});
        var mergedProps = {};

        if (_debug) {
            console.log(Base.name, '- 3. WrappedClass.render', 'initialState', initialState);
        }

        // Do not know if `_state` is safe to use.
        initialState.forEach(function(state, index) {
            stores[index]._state = fromJS(state);
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
            context.isServer = !!context.req;
            context.stores = initStore(Base.getStores, context.req);

            if (_debug) {
                console.log(Base.name, '- 1. WrappedClass.getInitialProps create stores', context.stores);
            }

            resolve(Promise.all([
                context.isServer,
                context.stores,
                context.req,
                Base.getInitialProps ? Base.getInitialProps.call(Base, context) : {}
            ]));
        }).then(function(result) {
            var states = result[1].map(function(s) {
                return s.getState().toJS();
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
