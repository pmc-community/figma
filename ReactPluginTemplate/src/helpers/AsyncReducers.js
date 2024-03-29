import { combineReducers } from "redux";
// NOT USED FOR FIGMA PLUGINS
/*
    import { persistReducer } from "redux-persist";
    import { broadcastMessage, customMessage } from '../helpers/utilities';
    import { reducerInformation } from '../helpers/private-utilities';
*/

class AsyncReducers {

    // NOT USED FOR FIGMA PLUGINS
    /*
    constructor(store, originalReducers, persistConfiguration, asyncReducerInfo, newActionsList, nested, nestedPersistence, nestedReducerName) {

        if (!this.checkReducers(store, asyncReducerInfo, nested, nestedReducerName)) broadcastMessage(8, process.env.REACT_APP_APP_NAME);
        else {
            if (!this.checkActions(store, newActionsList)) broadcastMessage(6, process.env.REACT_APP_APP_NAME);
            else {
                if (nested)
                    this.createAsyncNestedReducer(store, originalReducers, persistConfiguration, asyncReducerInfo, nestedPersistence, nestedReducerName);
                else {
                    Object.keys(asyncReducerInfo).forEach((reducer) => {
                        this.createAsyncReducer(store, originalReducers, persistConfiguration, asyncReducerInfo[reducer]);
                    });
                }
                store.actionTypes = { ...store.actionTypes, ...newActionsList };

                this.addAppToWAFCommon(store, nestedReducerName, asyncReducerInfo, newActionsList);

                broadcastMessage(5, process.env.REACT_APP_APP_NAME);
            }
        }
    }

    addAppToWAFCommon(store, nestedReducerName, asyncReducerInfo, newActionsList) {
        // build a payload for the WAF app update action
        const payload = {
            appName: this.getAppName(nestedReducerName),
            rootStateKey: nestedReducerName,
            reducers: this.getSimpleReducersList(asyncReducerInfo),
            actions: this.getSimpleActionsList(newActionsList)
        };

        // adding the app to ihsWAFCommon reducer (slice of state)
        store.dispatch({ type: "IHS_UPDATE_WAF_APPS", payload: payload });
    }

    getAppName(nestedReducerName) {
        // extract app name from nestedReducerName
        // appName = nestedReducerName without "Root"
        return nestedReducerName.substring(0, nestedReducerName.length - "Root".length);
    }

    getSimpleActionsList(newActionsList) {
        let actions = [];
        Object.keys(newActionsList).forEach((actionKEy) => {
            actions.push(actionKEy);
        });
        return actions;
    }

    getSimpleReducersList(asyncReducerInfo) {
        let reducers = [];
        asyncReducerInfo.forEach((reducer) => {
            let reducerObject = {};
            reducerObject.name = reducer.name;
            reducerObject.stateKey = reducer.stateKey;
            reducerObject.persistent = reducer.persistent;
            reducers.push(reducerObject);

        });
        return reducers;
    }

    createAsyncNestedReducer(s, or, pc, ari, nPer, nName) {

        // SAVE THE EXISTING asyncReducers LIST
        // will be used later to restore the list without nested reducers
        // because the grouping must be temporarry restored
        // otherwise nested reducers will be distroyed by new async reducers
        let currentAsyncReducers = s.asyncReducers;

        let tempReducer = {};
        let composedReducer = {};
        let composedReducerActions = {};
        let individualReducers = {};
        let individualReducersInfo = {};
        Object.keys(ari).forEach((reducer) => {
            tempReducer[ari[reducer].stateKey] = ari[reducer].function;
            composedReducer = { ...composedReducer, ...tempReducer };
            composedReducerActions = { ...composedReducerActions, ...ari[reducer].actions };

            // creating a list of individual reducers
            // to be added later to the store as individual reducers
            individualReducers[ari[reducer].stateKey] = ari[reducer].function;
            individualReducersInfo[ari[reducer].stateKey] = ari[reducer];

        });
        Object.defineProperty(composedReducer, "name", { value: nName });
        const composedReducer_redInfo = reducerInformation(composedReducer, nPer, composedReducerActions);
        s.asyncReducersInfo[nName] = composedReducer_redInfo;

        // NESTED REDUCERS MUST BE RECREATED TEMPORARRY USING asyncReducersInfo LIST
        s.asyncReducers = {};
        Object.keys(s.asyncReducersInfo).forEach((reducer) => {
            let subReducers = s.asyncReducersInfo[reducer].function;
            let restricted = {};
            if (typeof subReducers !== 'function') {
                s.asyncReducers[reducer] = combineReducers(s.asyncReducersInfo[reducer].function);
                Object.keys(subReducers).forEach((subReducer) => {
                    restricted[subReducer] = subReducers[subReducer];
                });
            }
            else {
                if (!restricted.hasOwnProperty(reducer)) {
                    s.asyncReducers[reducer] = s.asyncReducersInfo[reducer];
                }
            }
        });

        // ADDING THE NEW NESTED REDUCER TO THE asyncReducers LIST
        s.asyncReducers[nName] = combineReducers(composedReducer);
        if (nPer) pc.whitelist.push(nName);
        else pc.blacklist.push(nName);

        s.replaceReducer(persistReducer(pc, AsyncReducers.createReducer(or, s.asyncReducers)));

        // HERE THE NOT-NESTED asyncReducers LIST MUST BE RESTORED FROM currentAsyncReducers
        s.asyncReducers = {};
        s.asyncReducers = { ...currentAsyncReducers, ...individualReducers };

        // adding sub-reducers to the store as individual reducers
        s.asyncReducers = { ...s.asyncReducers, ...individualReducers };
        s.asyncReducersInfo = { ...s.asyncReducersInfo, ...individualReducersInfo };

        // removing root reducer from the store since is only used to group individual reducers states
        // and does not have it's own actions
        //delete s.asyncReducersInfo[nName];
        delete s.asyncReducers[nName];

    }

    createAsyncReducer(s, or, pc, ari) {

        s.asyncReducers[ari.stateKey] = ari.function;
        s.asyncReducersInfo[ari.stateKey] = ari;

        if (ari.persistent) pc.whitelist.push(ari.stateKey);
        else pc.blacklist.push(ari.stateKey);

        s.replaceReducer(persistReducer(pc, AsyncReducers.createReducer(or, s.asyncReducers)));
    }
    */

    // THIS IS THE ONLY METHOD USED IN FIGMA PLUGINS 
    // ------------------------------------------------------------------
    // static method that can be used outside the class also
    // it is used in reducers-index.js when we init the store with the static/global reducers
    static createReducer = (originalRed, asyncRed) => {

        //return asyncRed ? combineReducers({ ...originalRed, ...asyncRed }) : combineReducers(originalRed);
        return asyncRed ? combineReducers({ ...originalRed, ...asyncRed }) : combineReducers(originalRed);
    }
    // -----------------------------------------------------------------

    /*
    checkActions(s, al) {
        if (typeof s.actionTypes === 'undefined') s.actionTypes = {};
        const currentActions = s.actionTypes;
        if (currentActions.length === 0) return true;
        if (typeof al === 'undefined') return false;
        if (al.length === 0) return false;
        if (!this.checkArrays(Object.keys(al), Object.keys(currentActions))) return false;
        if (!this.checkArrays(Object.values(al), Object.values(currentActions))) return false;
        return true;
    }

    checkArrays(toBeChecked, reference) {
        let res = true;
        for (let val of toBeChecked) {
            if (reference.indexOf(val) >= 0) {
                res = false;
                broadcastMessage(7, process.env.REACT_APP_APP_NAME, customMessage(val));
                break;
            }
        }
        return res;
    }

    checkReducers(s, rl, nest, nestName) {
        if (typeof s.asyncReducers === 'undefined') return false;
        if (s.asyncReducers.length === 0) return true;
        if (typeof rl === 'undefined') return false;
        if (rl.length === 0) return false;

        let currentReducers = [];
        Object.keys(s.staticReducers).forEach((reducer) => { currentReducers.push(reducer) });
        Object.keys(s.asyncReducers).forEach((reducer) => { currentReducers.push(reducer) });

        let newReducers = [];
        Object.keys(rl).forEach((reducer) => { newReducers.push(rl[reducer].stateKey); });
        if (nest) newReducers.push(nestName);

        if (!this.checkArrays(newReducers, currentReducers)) return false;

        return true;
    }
    */
}

export default AsyncReducers;