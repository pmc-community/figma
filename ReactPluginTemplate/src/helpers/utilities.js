import MultipleLoader from '../helpers/MultipleLoader';
import {thunk} from "redux-thunk";

export const broadcastMessage = (messageCode, issuer, message) => {
    console.log(issuer + ' say: ' + messageCode + '/' + message);
}

export const customMessage = (message) => {
    return ' (' + message + ') ';
}

export { reducerInformation } from "./private-utilities";

export function getClassNameFromString(t) {
    let classDef = t.trim();
    if (classDef.indexOf('class') !== 0) return false;
    let startPos = classDef.indexOf('class') + 'class'.length + 1;
    let endPos = classDef.indexOf('{');
    if (!endPos) return false;
    if (endPos <= startPos) return false;
    let className = classDef.substring(startPos, endPos);
    return className.trim();
}

export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function sendStateToPlugin (store) {
    const crtState = store.getState();
    parent.postMessage({ 
        pluginMessage: { 
            type: process.env.REACT_REDUX_STATE, 
            crtState 
        } 
    },
    "*"
    );
}

export function getAllMiddlewares() {
    const middlewareFunctions = new MultipleLoader('middleware').output;
    let middlewareArray = [];
    Object.keys(middlewareFunctions).forEach((middlewareFunction) => { 
        middlewareArray.push(middlewareFunctions[middlewareFunction]); 
    });
    middlewareArray.push(thunk);
    return middlewareArray;
}

export function getAllDynamicCode() {
    return new MultipleLoader('dynamic_code').output;
}

export function sendMessageToParent(message) {
    return new Promise((resolve, reject) => {
        const handleMessage = event => {
            window.removeEventListener('message', handleMessage);
            resolve(event.data);
        };

        // Add event listener for messages from the parent window
        window.addEventListener('message', handleMessage);

        // Send message to the parent window
        parent.postMessage(message, '*');
    });
}

 export async function sendMessageAndWaitForAnswer(msg) {
    const message = msg;
    return await sendMessageToParent(message);
    }