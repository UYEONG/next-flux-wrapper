import React, {Component} from 'react';
import Link from 'next/link';
import ACTION_TYPES from '../base/actionTypes';
import app from '../stores/app';
import withFlux from 'next-flux-wrapper';

class IndexPage extends Component {
    static getInitialProps({isServer, dispatch, res}) {
        if (isServer) {
            dispatch({
                type: ACTION_TYPES.INITIAL,
                locale: 'ko-KR',
                token: '6c9df5871d2477e1b41b537e9085e08d45d3f276'
            });
        }

        return {
            name: 'Hello Next.js! - Index',
            description: 'Flux wrapper for Next.js',
            code: (res && res.statusCode || 'unknown')
        };
    }

    static getStores() {
        return [app];
    }

    static calculateState() {
        // Because Node.js creates a new instance.
        const [app] = IndexPage.getStores();
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
                    <dt>Status Code</dt>
                    <dd>{this.props.code}</dd>
                    <dt>Locale</dt>
                    <dd>{this.state.locale}</dd>
                    <dt>Token</dt>
                    <dd>{this.state.token}</dd>
                </dl>
                <hr/>
                <Link href="/about">
                    <a>Go to about page.</a>
                </Link>
            </div>
        );
    }
}

withFlux.setDebug(true);

export default withFlux(IndexPage);
