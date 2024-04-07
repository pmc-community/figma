import * as actions from "../redux-actions/types";
import GetInitialState from "../helpers/GetInitialState";
import * as reducerActions from "../redux-actions/mainAppActions";

// FOR BETTER IDENTIFICATION IN COMPLEX PLUGINS, IT IS RECOMMENDED TO NAME THE REDUCERS BASED ON
// RELATED COMPONENT NAME. THIS WILL BECOME ALSO THE KEY OF THE REDUCER SLICE IN THE STORE STATE

// IMPORTANT!!!!!
// THE WORD "Reducer" MUST BE ADDED TO THE NAME, SO THE FULL NAME SHALL BE "reducer-nameReducer" OR
// component-nameReducer IF THE REDUCER IS CONNECTED TO A SPECIFIC COMPONENT OR whatever-nameReducer

// THE INITIAL STATE MUST BE DEFINED IN redux-common/state-common.js
function mainAppReducer(state = new GetInitialState('mainAppReducer').initialState, action) {
    let updItem;
    let newState;

    switch (action.type) {

        case actions.mainApp_LOAD_SAVED_STATE:
            return action.payload;

        case actions.mainApp_TEST:
            updItem = typeof state.test_prop === 'undefined' ? 1 : state.test_prop + 1;
            newState = {
                ...state,
                test_prop: updItem
            };
            return newState;

        case actions.mainApp_INIT_STATE:
            newState = {
                ...state,
                test_prop: 0
            };
            return newState;

        case actions.mainApp_UPDATE_STATE:
            newState = {
                ...state,
                test_prop: action.payload
            };
            return newState;

        default:
            return state;
    }

}

// The name of the reducer function shall be enforced because the minified version
// of the compiled bundle will alter this name and this will cause errors when
// further configure the store for the reducer
Object.defineProperty(mainAppReducer, "name", { value: 'mainAppReducer' });

export const mainAppReducer_redInfo = {
    function: mainAppReducer,
    get name() { return this.function.name },
    persistent: false,
    get stateKey() { return this.name.substring(0, this.name.length - 7); },
    actions: reducerActions,
    persist: true
};
