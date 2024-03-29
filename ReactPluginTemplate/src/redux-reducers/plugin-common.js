import * as actions from "../redux-actions/types";
import GetInitialState from "../helpers/GetInitialState";
import * as reducerActions from "../redux-actions/pluginCommonActions";

function pluginCommonReducer(state = new GetInitialState('pluginCommonReducer').initialState, action) {

    switch (action.type) {

        case actions.pluginCommon_LOAD_SAVED_STATE:
            return state;

        default:
            return state;
    }

}


// The name of the reducer function shall be enforced because the minified version
// of the compiled bundle may alter this name and this will cause errors when
// further configure the store for the reducer

// PERSISTENCE IS SET TO FALSE BECAUSE redux-persist IS NOT USED IN FIGMA PLUGINS
// SEE reducers-index.js
Object.defineProperty(pluginCommonReducer, "name", { value: 'pluginCommonReducer' });
export const pluginCommonReducer_redInfo = {
    function: pluginCommonReducer,
    get name() { return this.function.name },
    persistent: false,
    get stateKey() { return this.name.substring(0, this.name.length - 7); },
    actions: reducerActions,
    persist:true
};

