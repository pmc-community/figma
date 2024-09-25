// hooks can be any function that was not yet executed at the moment when this script is loaded
// it works both with functions already defined in the global scope (window.func = () => {...})
// or with functions that are not in the global scope, but defined in the classical way, not as arrow functions
// these are useful whn needed to extend the functionality of functions that are executed based on user action

postHooks = {

    get currentPage() { return {title: $('page-data-title').text(), permalink: $('page-data-permalink').text()} },

    targetFunctions: [],

    addAction: (whereToAdd, action ) => {
        hook = _.find(postHooks.targetFunctions, {func: whereToAdd});
        if (!hook || hook === undefined) {
            funcObj = {
                func: whereToAdd,
                cb:[]
            }
            
            postHooks.targetFunctions.push(funcObj);
            hook = _.find(postHooks.targetFunctions, {func: whereToAdd});
        }
        if (hook && hook !== undefined) hook.cb.push(action);
    },

    // used for functions that are not defined in the global scope
    // HEADS UP!!! THESE FUNCTIONS MUST BE DEFINED IN CLASSICAL WAY function func(args) {}
    // ARROW FUNCTION DEFINITIONS DOESN'T WORK; IT MOVES THE FUNCTION TO THE GLOBAL SCOPE,
    // BUT DOESN'T REMOVE THE ORIGINAL, THUS WILL EXECUTE IT AND WILL NOT BE INTERCEPTED
    addActionEX: (func, action ) => {
        whereToAdd = func.name;
        // first, moving to global scope and remove the original
        if  (typeof window[whereToAdd] !== 'function') { window[func.name] = func; func=undefined;}
        postHooks.addAction(whereToAdd, action);
    },

    addNoteAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            'userToken': userToken,
            'event': 'Add_Custom_Note' 
        };
        fireGTMTag(gtmObject);
    },

    addTagAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            'userToken': userToken,
            'event': 'Add_Custom_Tag' 
        };
        fireGTMTag(gtmObject);
    },
    addCatAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            'userToken': userToken,
            'event': 'Add_Custom_Cat' 
        };
        fireGTMTag(gtmObject);
    }
}

postHooks.addAction('addNote', bindArgsAtEnd(postHooks.addNoteAction, [])); // hook by function name
postHooks.addAction('addTag', bindArgsAtEnd(postHooks.addTagAction, []));
postHooks.addAction('addCat', bindArgsAtEnd(postHooks.addCatAction, []));
postHooks.addActionEX(deleteNote, (functionName, result, args) => { 
    console.log(`sample post-hook after: ${functionName} on ${postHooks.currentPage.permalink}`) 
}); // hook by function object
