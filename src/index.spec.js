import React from 'react';
import {Map} from 'immutable';
import transit from 'transit-immutable-js';
import {Dispatcher} from 'flux';
import {ReduceStore} from 'flux/utils';
import {mount} from 'enzyme';
import withFlux from './index';

const dispatcher = new Dispatcher();
const dispatch = dispatcher.dispatch.bind(dispatcher);

class Store extends ReduceStore {
    getInitialState() {
        return Map({foo: ''});
    }

    reduce(state, action) {
        switch (action.type) {
            case 'foo':
                return state.set('foo', action.value);
            default:
                return state;
        }
    }
}

function createDummyPage(store, async = false) {
    class DummyPage extends React.Component {
        static getInitialProps() {
            if (async) {
                return new Promise((resolve) => {
                    dispatch({type: 'foo', value: 'state-foo-value'});
                    resolve();
                }).then(() => {
                    return {
                        bar: 'props-bar-value'
                    };
                });
            }

            dispatch({type: 'foo', value: 'state-foo-value'});

            return {
                bar: 'props-bar-value'
            };
        }

        static getStores() {
            return [store];
        }

        static calculateState() {
            return {
                foo: store.getState().get('foo')
            };
        }

        render() {
            return (
                <div>
                    <dl>
                        <dt>Foo</dt>
                        <dd>{this.state.foo}</dd>
                        <dt>Bar</dt>
                        <dd>{this.props.bar}</dd>
                    </dl>
                </div>
            );
        }
    }

    class AsyncPage extends DummyPage {
        static getInitialProps() {
            return new Promise((resolve) => {
                dispatch({type: 'foo', value: 'state-foo-value'});
                resolve();
            }).then(() => {
                return {
                    bar: 'props-bar-value'
                };
            });
        }
    }

    return async ? AsyncPage : DummyPage;
}

async function next(Component) {
    const props = await Component.getInitialProps();
    const rendered = mount(<Component {...props}/>);

    return {
        props,
        rendered
    };
}

test('simple store integration', async () => {
    const store = new Store(dispatcher);
    const DummyPage = createDummyPage(store);
    const {props, rendered} = (await next(withFlux(DummyPage)));

    expect(transit.fromJSON(props.initialState[0]).get('foo')).toBe('state-foo-value');
    expect(props.initialProps.bar).toBe('props-bar-value');
    expect(rendered.find('dd').at(0).text()).toEqual('state-foo-value');
    expect(rendered.find('dd').at(1).text()).toEqual('props-bar-value');
});

test('async store integration', async () => {
    const store = new Store(dispatcher);
    const DummyPage = createDummyPage(store, true);
    const {props, rendered} = (await next(withFlux(DummyPage)));

    expect(transit.fromJSON(props.initialState[0]).get('foo')).toBe('state-foo-value');
    expect(props.initialProps.bar).toBe('props-bar-value');
    expect(rendered.find('dd').at(0).text()).toEqual('state-foo-value');
    expect(rendered.find('dd').at(1).text()).toEqual('props-bar-value');
});

test('simple props', async () => {
    const store = new Store(dispatcher);

    class App extends React.Component {
        static getStores() {
            return [store];
        }

        static calculateState() {
            return {};
        }

        render() {
            return (
                <div>{this.props.foo}</div>
            );
        }
    }

    const WrappedApp = withFlux(App);
    const rendered = mount(<WrappedApp foo="foo"/>);

    expect(rendered.text()).toEqual('foo');
});
