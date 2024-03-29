export const _listener =  (e) => {
    console.log(e.data.pluginMessage);
    return e.data.pluginMessage;
    // here to add message handlers
    /*
    if (e.data.pluginMessage.type === process.env.REACT_STORE_INITIAL_STATE) {
        PluginStore.dispatch({type:actions.LOAD_SAVED_STATE, payload:e.data.pluginMessage.data})
    }
    */
}