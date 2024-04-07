import * as actions from "./types";

export const pluginLoadSavedSate = () => {
    dispatch({ type: actions.pluginCommon_LOAD_SAVED_STATE, payload: null });
}