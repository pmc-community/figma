// ACTION TYPES MUST FOLLOW THE NAMING CONVENTION <reducerName>/ACTION_TYPE
// BECAUSE <reducerName> IS USED IN MIDDLEWARES AND REDUX DOES NOT OFFER A
// DEDICATED METHOD TO RETRIEVE THE REDUCER NAME INSIDE A MIDDLEWARE.
// REDUCER NAME IS ALSO THE KEY OF THE REDUCER SLICE IN THE STORE STATE

// action types for plugin common reducer - general actions
export const pluginCommon_LOAD_SAVED_STATE = "pluginCommon_LOAD_SAVED_STATE"

// action types for mainApp Component reducer
export const mainApp_LOAD_SAVED_STATE = "mainApp_LOAD_SAVED_STATE"; // this must be mandatory for each reducer
export const mainApp_TEST = "mainApp_TEST";
export const mainApp_INIT_STATE = "mainApp_INIT_STATE";
export const mainApp_UPDATE_STATE = "mainApp_UPDATE_STATE";


