import ReduxStoreConnector from '../redux-connector/store-connector';
import * as util from '../helpers/utilities';
import { PluginStore } from '../redux-common/store';
import _ from "lodash";
import { getDiff, applyDiff, rdiffResult } from 'recursive-diff';

export class ReduxConnectedClass { constructor(originalClass) { return connectClassToRedux(originalClass); } }

export function connectClassToRedux(cls) {
    const conn = new ReduxStoreConnector(cls);

    Object.assign(cls.prototype, { ...conn.allActions, ...{ utilities: util } });
    Object.assign(cls.prototype, { store: IHSBEStore });
    const className = util.getClassNameFromString(cls.toString());
    Object.assign(cls.prototype, { originClass: className ? className : 'UNKNOWN' });
    Object.assign(cls.prototype, { data: cls.prototype.store.getState() });
    Object.assign(cls.prototype, { reduxConnected: true });
    delete cls.prototype.instanceId;

    const instanceId = util.uuid();
    Object.assign(cls.prototype, { instanceId: instanceId });

    delete cls.prototype.id_messageFromWorker;
    Object.assign(cls.prototype, { id_messageFromWorker: process.env.REACT_APP_ID_MESSAGE_TO_CALLER_PREFIX + className + '_' + instanceId });

    const instanceTimestamp = Date.now();
    Object.assign(cls.prototype, { instanceTimestamp: instanceTimestamp });

    const restrictedClasses = JSON.parse(process.env.REACT_APP_WORKER_RESTRICTED_CLASSES);
    if (!restrictedClasses.includes(className)) {
        delete cls.prototype.workerMethodsHandler;
        function workerMethods() { if (typeof cls.prototype.setWorkersMethods === 'function') cls.prototype.setWorkersMethods(); }
        Object.assign(cls.prototype, { workerMethodsHandler: workerMethods.call() });
    }

    return cls;
}

export class ReduxDisconnectedClass { constructor(connectedClass) { return disconnectClassFromRedux(connectedClass); } }

export function disconnectClassFromRedux(cls) {
    delete cls.prototype.instanceId;
    const instanceId = util.uuid();
    Object.assign(cls.prototype, { instanceId: instanceId });

    delete cls.prototype.instanceTimestamp;
    const instanceTimestamp = Date.now();
    Object.assign(cls.prototype, { instanceTimestamp: instanceTimestamp });

    const className = util.getClassNameFromString(cls.toString());
    Object.assign(cls.prototype, { originClass: className ? className : 'UNKNOWN' });

    delete cls.prototype.id_messageFromWorker;
    Object.assign(cls.prototype, { id_messageFromWorker: process.env.REACT_APP_ID_MESSAGE_TO_CALLER_PREFIX + className + '_' + instanceId });

    Object.assign(cls.prototype, { reduxConnected: false });

    const restrictedClasses = JSON.parse(process.env.REACT_APP_WORKER_RESTRICTED_CLASSES);
    if (!restrictedClasses.includes(className)) {
        delete cls.prototype.workerMethodsHandler;
        function workerMethods() { if (typeof cls.prototype.setWorkersMethods === 'function') cls.prototype.setWorkersMethods(); }
        Object.assign(cls.prototype, { workerMethodsHandler: workerMethods.call() });
    }

    const staticKeysToBeRemoved = ['utilities', 'store', 'data'];
    const staticReducersToBeRemoved = [];
    const asyncReducersToBeRemoved = [];

    const staticReducers = IHSBEStore.staticReducers;
    if (staticReducers) Object.keys(staticReducers).forEach((reducer) => { staticReducersToBeRemoved.push(reducer + 'Actions'); });

    const asyncReducers = IHSBEStore.asyncReducers;
    if (asyncReducers) Object.keys(asyncReducers).forEach((reducer) => { asyncReducersToBeRemoved.push(reducer + 'Actions'); });

    [...staticKeysToBeRemoved, ...staticReducersToBeRemoved, ...asyncReducersToBeRemoved].forEach((key) => { delete cls.prototype[key]; });
    return cls;
}

export function getReduxStoreReducerInformation(reducerType) {
    return typeof IHSBEStore[reducerType] === 'undefined' ? false : IHSBEStore[reducerType];
}

export function setObserveStore() {
    let currentValue;
    function handleChange() {
        let previousValue = currentValue;
        currentValue = IHSBEStore.getState();

        if (typeof previousValue !== 'undefined' && !_.isEqual(previousValue, currentValue)) {
            let diff = getDiff(previousValue, currentValue);
            document.dispatchEvent(new CustomEvent(process.env.REACT_APP_REDUX_STATE_CHANGED, { detail: diff }));
        }
    }
    const unsubscribe = IHSBEStore.subscribe(handleChange);
    return unsubscribe;
}

export function getSingleValue(pathToValue) {
    let path = _.isString(pathToValue) ? pathToValue : pathToValue.join('.');
    let state = IHSBEStore.getState();
    return _.get(state, path);
}

export function getAllValues(key) {
    let state = IHSBEStore.getState();
    let emptyState = {};
    let diff = getDiff(emptyState, state);
    let values = diff.filter(data => !data.path.includes(key));
    return values;
}

export function singleValueChanged(diff, pathToValue) {
    let path = _.isString(pathToValue) ? pathToValue : pathToValue.join('.');
    let changes = diff.filter(data => data.path.join('.').indexOf(path) != 0);
    return changes.length > 0 ? true : false;
}