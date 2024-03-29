import * as React from "react";

import ReduxStoreConnector from "../redux-connector/store-connector";
import { connect } from "react-redux";

import pages from '../../manifest.json'
import _ from 'lodash'

import ListGroup from 'react-bootstrap/ListGroup';
import ArrowRightIco from "../components-simple/arrow-right-ico";

class NavigationMenu extends React.Component <any, any> {

    constructor(props) {
        super(props);
        this.state = {
            pageList: Object.keys(pages.ui),
        };
    }

    randomMenuItemVariant = () => {
        const vars = ['primary','success','danger','warning','info'];
        return vars[_.random(0,4)];
    }

    onPageSelected = (e,page) => {
        e.preventDefault();
        let message;
        switch (page) {
            case 'main':
                message = process.env.REACT_NAVIGATE_MAIN;
                break;
            case 'secondary':
                message = process.env.REACT_NAVIGATE_SECONDARY;
                break;
            default:
                message = process.env.REACT_NAVIGATE_MAIN;
                break;
        }

        parent.postMessage(
            { pluginMessage: { type: message } },
            "*"
        );
    }

    render() {
        return (

            <ListGroup variant='flush' className='border-0'>
                {this.state.pageList.map((item, index) => (
                    <ListGroup.Item className='border-0' variant={this.randomMenuItemVariant()} key={index} action onClick={(e)=>this.onPageSelected(e, item)}>
                        <div className='d-flex justify-content-between'>        
                        <span className='fs-6 text-capitalize'>
                            {item}
                        </span>
                        <ArrowRightIco color='text-dark' size={25}/>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            );
    }
}

const reduxConnector = new ReduxStoreConnector(NavigationMenu);

export const NavigationMenu_KEY = {
  component: connect(reduxConnector.allProps, reduxConnector.allDispatch)(NavigationMenu),
  target: process.env.REACT_NAVIGATION_COMPONENT_TARGET
}
