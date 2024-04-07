import { states } from "../redux-common/state-common";

class GetInitialState {
    constructor(reducer) {
        this.initialState = this.getInitialState(reducer);
    }

    getInitialState(r) {
        return states[r];
    }
}

export default GetInitialState;