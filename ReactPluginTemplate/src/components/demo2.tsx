import * as React from "react";
import _ from 'lodash'

import ReduxStoreConnector from "../redux-connector/store-connector";
import { connect } from "react-redux";

import Button from 'react-bootstrap/Button';

class DemoComponent2 extends React.Component <any, any> {

constructor(props) {
    super(props);
  }

randomVariant = () => {
    const vars = ['primary','success','danger','warning','info'];
    return vars[_.random(0,4)];
}

incrementReduxState = () => {
    this.props.mainAppTestAction();
  };

render() {
    return (
        <Button variant={this.randomVariant()} onClick={this.incrementReduxState} className='w-100'>
            <span className="d-block">Playing with {this.props.mainApp.test_prop} rectangle(s).</span>
            <span className="d-block">Click to add more ...</span>
        </Button>
    );
  }
}

const reduxConnector = new ReduxStoreConnector(DemoComponent2);

export const DemoComponent2_KEY = {
  component: connect(reduxConnector.allProps, reduxConnector.allDispatch)(DemoComponent2),
  target: process.env.REACT_DEMO_COMPONENT_2_TARGET
}
