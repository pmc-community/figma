
hooks = {

    targetFunctions: [
        { func:"addNote", cb: [] },
        {
            func:"addTag",
            cb: [
                (functionName, result, args) => {
                console.log(functionName)
                },
            ]
            
        },
        {
            func:"addCat",
            cb: [
                (functionName, result, args) => {
                console.log(functionName)
                }
            ]
        }
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
    }
}

hooks.addAction('addNote', bindArgsAtEnd(hooks.addNoteAction, []));
