
hooks ={
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
    }
}

hooks.addAction('addNote', (functionName, result, args) => {
    console.log(args)
});
