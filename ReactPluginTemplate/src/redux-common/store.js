import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "../redux-reducers/reducers-index";
import { getAllMiddlewares } from '../helpers/utilities';

const preloadedState = {};
export const PluginStore =  configureStore({ 
    reducer:rootReducer,
    middleware:() => getAllMiddlewares(), 
    preloadedState:preloadedState 
});
