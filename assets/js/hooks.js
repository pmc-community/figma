
hooks = {

    targetFunctions: [
        { func:"addNote", cb: [] },
        { func:"addTag", cb: [] },
        { func:"addCat", cb: [] }
    ],

    addAction: (whereToAdd, action ) => {
        hook = _.find(hooks.targetFunctions, {func: whereToAdd})
        if (hook && hook !== undefined) hook.cb.push(action);
    },

    addNoteAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            userToken: userToken,
            event: 'Add_Custom_Note' 
        };
        fireGTMTag(gtmObject);
    },

    addTagAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            userToken: userToken,
            event: 'Add_Custom_Tag' 
        };
        fireGTMTag(gtmObject);
    },
    addCatAction: (functionName, result, args, ...extraArgs) => {
        const userToken = Cookies.get(settings.user.userTokenCookie);
        gtmObject = {
            userToken: userToken,
            event: 'Add_Custom_Cat' 
        };
        fireGTMTag(gtmObject);
    }
}

hooks.addAction('addNote', bindArgsAtEnd(hooks.addNoteAction, []));
hooks.addAction('addTag', bindArgsAtEnd(hooks.addTagAction, []));
hooks.addAction('addTag', bindArgsAtEnd(hooks.addCatAction, []));
