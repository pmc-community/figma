class GlobalReducers {
    constructor(reducers) {
        this.whitelist = [];
        this.blacklist = [];
        this.globalReducers = {};
        this.getReducersInfo(reducers);
    }

    getReducersInfo(allReducers) {
        Object.keys(allReducers).forEach((reducer) => {

            // removes the word "Reducer" from the reducer name
            // and form the key of the reducer in the globalReducers object
            // that is further passed to combineReducers in reducers-index.js

            let reducerKey = allReducers[reducer].name.substring(0, allReducers[reducer].name.length - 7);
            if (allReducers[reducer].persistent)
                this.whitelist.push(reducerKey);
            else
                this.blacklist.push(reducerKey);

            let tempReducer = {};
            tempReducer[reducerKey] = allReducers[reducer].function;
            this.globalReducers = { ...this.globalReducers, ...tempReducer };
        });
    }

}

export default GlobalReducers;