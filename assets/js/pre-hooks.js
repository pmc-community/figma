// hooks can be any function that is executed until the page is fully loaded
// functions must be defined in the global scope (window.func = (...) => {...})

preHooks = {

    get currentPage() { return {title: $('page-data-title').text(), permalink: $('page-data-permalink').text()} },
    targetFunctions: [],

    addAction: (whereToAdd, action ) => {
        hook = _.find(preHooks.targetFunctions, {func: whereToAdd});
        if (!hook || hook === undefined) {
            funcObj = {
                func: whereToAdd,
                cb:[]
            }
            
            preHooks.targetFunctions.push(funcObj);
            hook = _.find(preHooks.targetFunctions, {func: whereToAdd});
        }
        if (hook && hook !== undefined) hook.cb.push(action);
    },

    addActionEX: (func, action ) => {
        whereToAdd = func.name;
        // first, moving to global scope and remove the original
        //if  (typeof window[whereToAdd] !== 'function') { window[func.name] = func; func=undefined;}
        postHooks.addAction(whereToAdd, action);
    },

}
preHooks.addAction('removeUselessElements', (functionName, result, args) => { console.log(`sample pre-hook after: ${functionName} on ${preHooks.currentPage.permalink}`) });
preHooks.addAction('setPageButtonsFunctions', (functionName, result, args) => { console.log(`sample pre-hook after: ${functionName} on ${preHooks.currentPage.permalink}`) });

