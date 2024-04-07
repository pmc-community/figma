import * as actions from "./types";

export const mainAppTestAction = () => (dispatch) => {
    dispatch({ type: actions.mainApp_TEST, payload: null });
};

export const mainAppInitStateAction = () => (dispatch) => {
    dispatch({ type: actions.mainApp_INIT_STATE, payload: null });
}

export const mainAppUpdateStateAction = (val) => (dispatch) => {
    dispatch({ type: actions.mainApp_UPDATE_STATE, payload: val });
}
