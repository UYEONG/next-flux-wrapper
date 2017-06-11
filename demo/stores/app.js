import {Map} from 'immutable';
import {ReduceStore} from 'flux/utils';
import dispatcher from '../base/dispatcher';
import ACTION_TYPES from '../base/actionTypes';

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

export default new App(dispatcher);
