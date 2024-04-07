import { sendStateToPlugin } from '../helpers/utilities';
import _ from 'lodash';

export const persistState = store => next => action => {
    let result;

    // need to check if action is the action creator or is actually the action dispatched
    // otherwise the middleware will be executed twice ... that wouldn't be good!!!
    if (typeof action !== 'function') {
        const crtState = store.getState();
        result = next(action);
        const nextState = store.getState();
        const reducerName = action.type.split('_')[0];
        console.log('reducer is: '+reducerName)
        if (!_.isEqual(crtState, nextState)) sendStateToPlugin(store);
    }
    else
        result = next(action);
    
    return result;
  };