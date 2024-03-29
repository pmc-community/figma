import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import Spinner20px from "../components-simple/preloader";

import { PluginStore } from "../redux-common/store";
import MultipleLoader from '../helpers/MultipleLoader';

import { _listener } from "../modules/react.message.handlers";

import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "../redux-reducers/reducers-index";
import { getAllMiddlewares } from '../helpers/utilities';
import { sendMessageAndWaitForAnswer } from '../helpers/utilities'
import pages from '../../manifest.json'


// Component Loader without store persistence
const ReactComponentLoader = (component, store, currentPage) => {
    // .... as HTMLElement may be needed because of TypeScript
    // const root = ReactDOM.createRoot(document.getElementById(component.target)) as HTMLElement);

    if (component.target !== 'none') {
        if (document.getElementById(component.target)) {
        const target = ReactDOM.createRoot(document.getElementById(component.target));
        const Component = component.component;
        if(target) {
            target.render(
                <Suspense fallback={<Spinner20px />}>
                    <Provider store={store}>
                        <Component page={currentPage} />
                    </Provider>
                </Suspense>
                );
            }
        }
    }
}

let page = sendMessageAndWaitForAnswer({pluginMessage: {type: process.env.REACT_REQUEST_PAGE_NAME}});

page
    .then( (crtPage) => {
       
        // this is needed because when code.ts starts the UI fro the first time, sometimes it doesn't send
        // the page name or we cannot send a message to react from code.js because we may mess with the
        // redux persistence message logic and overlap the message resposes (loading the saved state)
        // by default, we consider that the plugin main page is the first one defined in manifest.json
        // sending the page name from code.js to react app may be useful when components should have different
        // behaviour depending on the page where they are rendered
        const current = typeof crtPage.pluginMessage.data === 'undefined' || crtPage.pluginMessage.data === ''
            ? Object.keys(pages.ui)[0]
            : crtPage.pluginMessage.data;

        let answer = sendMessageAndWaitForAnswer({pluginMessage: {type: process.env.REACT_REQUEST_REDUX_INITIAL_STATE}});

        answer
            .then((reduxInitialState) => {
                const preloadedState = 
                    reduxInitialState === process.env.REACT_STORE_INITIAL_STATE && 
                    (
                        typeof reduxInitialState === 'undefined' || 
                        !reduxInitialState
                    )
                ? {}
                : reduxInitialState.pluginMessage.data;
                
                // the store must be reconfigured if there is a valid persistent state sent by code.js
                const PluginStore =  configureStore({ 
                    reducer:rootReducer,
                    middleware:() => getAllMiddlewares(), 
                    preloadedState:preloadedState 
                });

                // render each component in its own root div
                const components = new MultipleLoader('components').output;
                Object.keys(components).forEach((component) => {
                    ReactComponentLoader(components[component], PluginStore, current); 
                });
            })

            // after reconfiguration, the listener for messages sent by code.js must be restored
            // ortherwise no message will be received anymore 
            .then( () => {
                window.addEventListener('message', _listener);
            })

            // if there is an error above, the store will be created with empty state
            .catch( (err) => {
                // render each component in its own root div
                const components = new MultipleLoader('components').output;
                Object.keys(components).forEach((component) => {
                    ReactComponentLoader(components[component], PluginStore, current);
                });
                window.addEventListener('message', _listener);
            })
    } );



