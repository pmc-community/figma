// hooks can be any function that was not yet executed at the moment when this script is loaded
// it works both with functions already defined in the global scope (window.func = () => {...})
// or with functions that are not in the global scope, but defined in the classical way, not as arrow functions
// these are useful when needed to extend the functionality of functions that are executed based on user action (e.g. click on buttons)
// these can use any asset, function, object and accessible variable of the site
// HEADS UP!!!
// CANNOT DEFINE AN ACTION FOR A HOOK IN MULTIPLE PLACES. HOOK ACTIONS MUST BE DEFINED AS init OR pre OR post.
// DEFINING ACTIONS IN MULTIPLE PLACES WILL NOT RAISE ERRORS BUT WILL EXECUTE THE FIRST FOUND ACTION ONLY 

postHooksActions = {

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

hooks.addAction('addNote', globUtils.bindArgsAtEnd(postHooksActions.addNoteAction, [])); // hook by function name
hooks.addAction('addTag', globUtils.bindArgsAtEnd(postHooksActions.addTagAction, []));
hooks.addAction('addCat', globUtils.bindArgsAtEnd(postHooksActions.addCatAction, []));
hooks.addActionEX(deleteNote, (functionName, result, args) => { 
    console.log(`sample post-hook by object after: ${functionName} on ${$('page-data-permalink').text()}`) 
}); // hook by function object

hooks.addAction('addCat', (functionName, result, args) => { 
    console.log(`sample post-hook after: ${functionName} on ${$('page-data-permalink').text()}`) 
},4);

hooks.addAction('addCat', (functionName, result, args) => { 
    console.log(`sample post-hook after: ${functionName} on ${$('page-data-permalink').text()} higher priority`) 
},3);

hooks.addAction('createAutoSummaryPageContainer', (functionName, result, args) => { 
    console.log(`sample post-hook after nested function: ${functionName} on ${$('page-data-permalink').text()}`);

    nrLog(
        'created createAutoSummaryPageContainer', 
        'created createAutoSummaryPageContainer', 
        'info', 
        {
            functionName: functionName,
            result: result,
            args: args
        }
    );
}); // nested function but not used as dynamic handler; hook by function object is not possible for nested functions
