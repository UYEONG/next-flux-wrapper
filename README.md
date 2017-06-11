# next-flux-wrapper

Flux wrapper for Next.js - [DEMO](https://demo-hwvjthoxim.now.sh)

## Installation

### npm

```bash
npm install next-flux-wrapper --save
```

### Usage

```js
// stores/app.js
import {Map} from 'immutable';
import {ReduceStore} from 'flux/utils';

class App extends ReduceStore {
    getInitialState() {
        return Map({
            locale: 'unknown',
            token:  ''
        });
    }

    reduce(state, action) {
        switch (action.type) {
            case ACTION_TYPES.INITIAL:
                state = state.set('locale', action.locale);
                state = state.set('token',  action.token);
                return state;
            default:
                return state;
        }
    }
}

// pages/index.js
import {Component} from 'react';
import ACTION_TYPES from '../base/actionTypes';
import app from '../stores/app';
import withFlux from 'next-flux-wrapper';

class IndexPage extends Component {
    static getInitialProps({isServer, res}) {
        if (isServer) {
            dispatch({
                type: ACTION_TYPES.INITIAL,
                locale: 'ko-KR',
                token: '6c9df5871d2477e1b41b537e9085e08d45d3f276'
            });
        }

        return {
            name: 'Hello Next.js! - Index',
            description: 'Flux wrapper for Next.js'
        };
    }

    static getStores() {
        return [app];
    }

    static calculateState() {
        return {
            locale: app.getState().get('locale'),
            token: app.getState().get('token')
        };
    }

    render() {
        return (
            <div className="wrap">
                <header>
                    <h1>{this.props.name}</h1>
                    <p>{this.props.description}</p>
                </header>
                <dl>
                    <dt>Locale</dt>
                    <dd>{this.state.locale}</dd>
                    <dt>Token</dt>
                    <dd>{this.state.token}</dd>
                </dl>
            </div>
        );
    }
}

export default withFlux(IndexPage);
```

## License

MIT
