/* eslint-disable react/forbid-foreign-prop-types */

import PropTypes from "prop-types";
import * as utilities from "../helpers/utilities";
import { PluginStore } from "../redux-common/store";
import { allReducers } from "../redux-reducers/reducers-index";
import { bindActionCreators } from 'redux';

class ReduxStoreConnector {
    constructor(component) {
        this.component = component;
        this.allActions = this.getAllActions();
        this.defineComponentProps(component);
        this.allProps = this.mapEntityProps();
        this.allDispatch = this.mapEntityDispatch();
    }

    // GROUP ACTIONS UNDER RELATED REDUCER
    // returns an object for exposing to external javascript
    // returns and object with actions binded to REDUX store dispatch
    // to be used by mapDispatchToProps when connecting React components to REDUX
    groupActions(callType, dispatch) {

        function reducersList(s) {
            let staticReducers = allReducers;
            let asyncReducers = {};

            if (typeof s.asyncReducersInfo !== 'undefined') {
                Object.keys(s.asyncReducersInfo).forEach((reducer) => {
                    let subReducers = s.asyncReducersInfo[reducer].function;
                    if (typeof subReducers === 'function') {
                        // NOT-NESTED ASYNC REDUCERS
                        asyncReducers[reducer] = s.asyncReducersInfo[reducer];
                    }
                    else {
                        // NESTED ASYNC REDUCERS
                        Object.keys(subReducers).forEach((subReducer) => {
                            if (typeof subReducers[subReducer] === 'function') {
                                const subReducerObject = utilities.reducerInformation(subReducers[subReducer], true, s.asyncReducersInfo[reducer].actions);
                                asyncReducers[subReducer] = subReducerObject;
                            }
                        });
                    }
                });
            }
            return { ...staticReducers, ...asyncReducers };
        }

        let label;
        let reduxReducers = {};
        let tempAction = {};

        const fullReducers = reducersList(PluginStore);
        Object.keys(fullReducers).forEach((reducer) => {
            label = fullReducers[reducer].stateKey + 'Actions';
            
            tempAction = fullReducers[reducer].actions
                ? callType === "javascript"
                    ? fullReducers[reducer].actions
                    : bindActionCreators(fullReducers[reducer].actions, dispatch)
                : {};
            
            // the following may return a non plain object as actions will be grouped by reducer
            // may generate warnings when connecting a component to REDUX as connect() expects a plain object
            //tempAction[label] = bindActionCreators(fullReducers[reducer].actions, dispatch);
            reduxReducers = { ...reduxReducers, ...tempAction };
        });
        return reduxReducers;
    }

    // DYNAMIC GET ACTIONS
    // USED ONLY FOR EXPORTING ACTIONS TO JAVASCRIPT OUTSIDE REACT 
    getAllActions() {
        return this.groupActions("javascript", null);
    }

    defineComponentProps(component) {

        component.propTypes = {};
        Object.keys(this.allActions).forEach((key) => (component.propTypes[key] = PropTypes.func));

        let globalState = PluginStore.getState();
        Object.keys(globalState).forEach((reducer) => {
            let crtState = globalState[reducer];
            Object.keys(crtState).forEach((key) => {
                let typeOfKey = typeof crtState[key];
                switch (typeOfKey) {
                    case "number":
                        component.propTypes[key] = PropTypes.number;
                        break;
                    case "string":
                        component.propTypes[key] = PropTypes.string;
                        break;
                    case "boolean":
                        component.propTypes[key] = PropTypes.bool;
                        break;
                    case "object":
                        Array.isArray(crtState[key]) ? (component.propTypes[key] = PropTypes.array) : (component.propTypes[key] = PropTypes.object);
                        break;
                    default:
                        break;
                }

            })
        });
    }

    // DYNAMIC MAP REDUX STATE TO COMPONENT PROPS
    // WORKS WITH MULTIPLE REDUCERS
    // is not decomposing the state, is copying the state to props
    // inside components the props can be accessed with this.props.<reducer>.<prop.name>
    // ALSO ADDS THE UTILITIES AS METHODS IN THE CONNECTED COMPONENTS PROPS
    mapEntityProps() {
        const mapStateToProps = (state) => { return { ...state, ...{ utilities: utilities } }; };
        //const mapStateToProps = (state) => { return { ...state }; };
        return mapStateToProps;
    }
    
    // GROUPING ACTIONS FOR EACH REDUCER
    // actions will be methods in each connected component under props.<action-creator-name>
    mapEntityDispatch() {
        const mapDispatchToProps = (dispatch) => { return this.groupActions("react", dispatch); };
        return mapDispatchToProps;
    }
    
}

export default ReduxStoreConnector;