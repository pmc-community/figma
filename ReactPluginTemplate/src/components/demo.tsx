import * as React from "react";

import ReduxStoreConnector from "../redux-connector/store-connector";
import { connect } from "react-redux";
import pages from '../../manifest.json'

class DemoComponent extends React.Component <any, any> {

  constructor(props) {
    super(props);
    
  }

  conditionalRenderRectangle() {
    return (
      this.props.mainApp.test_prop === 1
        ? <div className='py-2'>
            <h4> 
              Playing with <span className='text-primary'>{this.props.mainApp.test_prop}</span> rectangle
            </h4>
          </div>
        : <div className='py-2'>
            <h4>
              Playing with <span className='text-primary'>{this.props.mainApp.test_prop}</span> rectangles
            </h4>
          </div>
    )
  }

  conditionalRenderMessage() {
    return (
      this.props.page === Object.keys(pages.ui)[0]
        ? <></>
        : <p className='text-secondary'>
            (open the menu to increase the number of rectangles or go back to main page to create them in Figma, reset or input the exact number you want)
          </p>
    )
  }

  render() {
    return (
      <div className='card border-0'>     
            {this.conditionalRenderRectangle()}
            {this.conditionalRenderMessage()}
      </div>  
    );
  }
}

const reduxConnector = new ReduxStoreConnector(DemoComponent);

export const DemoComponent_KEY = {
  component: connect(reduxConnector.allProps, reduxConnector.allDispatch)(DemoComponent),
  target: process.env.REACT_DEMO_COMPONENT_TARGET
}
