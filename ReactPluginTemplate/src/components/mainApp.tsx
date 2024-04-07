import * as React from "react";

import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import ReduxStoreConnector from "../redux-connector/store-connector";
import { connect } from "react-redux";

/* 
  ------------------------------------------------
  REACT Component as Function (using React Hooks)
  ------------------------------------------------
*/

/*
function App() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const count = Number(inputRef.current?.value || 0);
    parent.postMessage(
      { pluginMessage: { type: "create-rectangles", count } },
      "*"
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  return (
    <main>
      <header>
        <h2>Rectangle Creator</h2>
      </header>
      <section>
        <input id="input" type="number" min="0" ref={inputRef} />
        <label htmlFor="input">Rectangle Count</label>
      </section>
      <footer>
        <button className="brand" onClick={onCreate}>
          Create
        </button>
        <button onClick={onCancel}>Cancel</button>
      </footer>
    </main>
  );
}
*/

/* 
  ------------------------- 
  REACT Component as Class
  ------------------------- 
*/

class MainApp extends React.Component <any, any> {

  constructor(props) {
    super(props);
    //sample methods binding below --- may be needed
    //this.onClickBtn = this.onClickBtn.bind(this);
    //this.broadcastMessage = this.props.broadcastMessage.bind(this);
    //console.log(PluginStore.getState());
  }

  onCreate = () => {
    const count = this.props.mainApp.test_prop;
    if (count > 0 ) {
      parent.postMessage(
        { pluginMessage: { type: process.env.REACT_CREATE_RECTANGLES, count } },
        "*"
      );
    }
  };

  onCancel = () => {
    parent.postMessage({ pluginMessage: { type: process.env.REACT_CLOSE_PLUGIN } }, "*");
  };

  readRectangleNumber(e) {

    const val = isNaN(e.target.value) ? 0 : parseInt(e.target.value);
    this.props.mainAppUpdateStateAction(val);
  }

  initReduxState = () => {
    this.props.mainAppUpdateStateAction(1);
  }

  incrementReduxState = () => {
    this.props.mainAppTestAction();
  };

  render() {
    return (
      <main>
        <header>
          <p className="font-weight-bold text-sm-left text-primary">Rectangle Creator</p>
        </header>
        <section>
          <Form>
            <Form.Group className="mb-3">
              {/* using input instead of the control provided by bootsrap and adding className='form-control' */}
              {/* only because we want the increment/decrement arrows and bootstrap cannot provide this */}
              <input type='number' min='0' step='1' className='form-control' value={typeof this.props.mainApp.test_prop === 'undefined' || isNaN(this.props.mainApp.test_prop ) ? 0 : this.props.mainApp.test_prop} onChange={e => this.readRectangleNumber(e)}/>
            </Form.Group>
          </Form>
        </section>
        <footer>
          <div className="container">
            <div className="row">
              <div className="col">
                <ButtonGroup className="w-100">
                  <Button variant="primary" onClick={this.onCreate}>
                    Create
                  </Button>
                  <Button variant="success" onClick={this.initReduxState}>
                    Init
                  </Button>
                  <Button variant="warning" onClick={this.incrementReduxState}>
                    More
                  </Button>
                  <Button variant="dark" onClick={this.onCancel}>Exit</Button>
                </ButtonGroup>
              </div>
            </div>
        </div>
        </footer>
      </main>
    );
  }
}

const reduxConnector = new ReduxStoreConnector(MainApp);
export const MainApp_KEY = {
  component: connect(reduxConnector.allProps, reduxConnector.allDispatch)(MainApp),
  target: process.env.REACT_MAIN_APP_COMPONENT_TARGET
}