
import MultipleLoader from "../helpers/MultipleLoader";
import GlobalReducers from "../helpers/GlobalReducers";
import AsyncReducers from "../helpers/AsyncReducers";

/* FOR PERSISTENCE (NOT WORKING)
//import storage from 'redux-persist-indexeddb-storage';
//import createIdbStorage from '@piotr-cz/redux-persist-idb-storage'
//import createElectronStorage from "redux-persist-electron-storage";
//import { persistReducer } from "redux-persist";
*/

export const allReducers = new MultipleLoader('reducers').output;
const reducersInfo = new GlobalReducers(allReducers);
export const reducers = reducersInfo.globalReducers;

/*
// NOT USED IN FIGMA PLUGINS
export function injectAsyncReducer(store, asyncReducerInfo, actionsList, nested, nestedPersistence, nestedReducerName) {
    new AsyncReducers(store, reducers, persistConfig, asyncReducerInfo, actionsList, nested, nestedPersistence, nestedReducerName);
}
*/

/*
// for IndexedDB () redux-persist-indexeddb-storage
const persistConfig = {
    key: 'root',
    storage: storage('figma-plugin-redux'),
  }

// for IndexedDB @piotr-cz/redux-persist-idb-storage
const persistConfig = {
    key: 'root',
    storage: createIdbStorage({name: 'figma-plugin-redux', storeName: 'figma-plugin-redux_key'}),
    serialize: false, // Data serialization is not required and disabling it allows you to inspect storage value in DevTools
  }

  // for Electron storage
const persistConfig = {
  key: 'figma-plugin-redux-store',
  storage: createElectronStorage()
}
*/

const rootReducer = AsyncReducers.createReducer(reducers, {});
//const rootReducer = persistReducer(persistConfig, AsyncReducers.createReducer(reducers, {}));
export default rootReducer;

