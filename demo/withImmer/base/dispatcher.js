import {Dispatcher} from 'flux';

const dispatcher = new Dispatcher();
const dispatch = dispatcher.dispatch.bind(dispatcher);

export default dispatcher;
export {dispatch};
