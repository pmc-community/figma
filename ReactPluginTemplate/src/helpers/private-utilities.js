/*
// NOT USED IN FIGMA PLUGIN
import * as actionTypes from '../redux-actions/types';
import * as storeUtilities from './store-utilities';
//import { injectAsyncReducer, reducers } from "../redux-reducers/reducers-index";
*/

export const reducerInformation = (reducer, persistence, actions) => {
    return {
        function: reducer,
        get name() { return this.function.name },
        persistent: persistence,
        get stateKey() { return this.name.substring(0, this.name.length - 7); },
        actions: actions
    };
}

/*
// NOT USED IN FIGMA PLUGIN

export const additionalStoreInfo = (store) => {
    store.staticReducers = reducers;
    store.asyncReducers = {};
    store.asyncReducersInfo = {};

    //store.injectAsyncReducer = injectAsyncReducer;

    store.actionTypes = {};
    let tempActionType = {};
    Object.keys(actionTypes).forEach((actionType) => {
        tempActionType[actionType] = actionTypes[actionType];
        store.actionTypes = { ...store.actionTypes, ...tempActionType };
    });

    store.storeUtilities = storeUtilities;

}
*/



