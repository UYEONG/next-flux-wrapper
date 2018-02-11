import {ReduceStore} from 'flux/utils';
import produce from 'immer';
import dispatcher from '../base/dispatcher';
import ACTION_TYPES from '../base/actionTypes';

class App extends ReduceStore {
    getInitialState() {
        return {
            locale: 'unknown',
            token:  ''
        };
    }

    reduce(state, action) {
        return produce(state, (draft) => {
            switch (action.type) {
                case ACTION_TYPES.INITIAL:
                    draft.locale = action.locale;
                    draft.token = action.token;
                    break;
            }
        });
    }
}

export default new App(dispatcher);
