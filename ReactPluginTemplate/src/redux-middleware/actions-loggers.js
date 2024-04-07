export const actionLogger = store => next => action => {
    let result = next(action);
    if (typeof action !== 'function') console.log(action);
    return result;
}