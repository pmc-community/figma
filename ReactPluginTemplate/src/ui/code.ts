import * as messHandlers from '../modules/message.handlers';
import * as uiHandlers from '../modules/ui.handlers';
import {process} from '../modules/d_generated/plugin-globals.js'

uiHandlers.initUI();

figma.ui.onmessage = (msg) => {
  switch(msg.type) {

    case process.env.REACT_CREATE_RECTANGLES:
      messHandlers.handleCREATE_RECTANGLES(msg.count);
      break;
    
    case process.env.REACT_NAVIGATE_MAIN:
      messHandlers.handleNAVIGATE_MAIN();
      break;

    case process.env.REACT_NAVIGATE_SECONDARY:
      messHandlers.handleNAVIGATE_SECONDARY();
      break;

    case process.env.REACT_CLOSE_PLUGIN:
      messHandlers.handleCLOSE_PLUGIN();
      break;

    case process.env.REACT_RESIZE_PLUGIN_WINDOW:
      messHandlers.handleRESIZE_PLUGIN_WINDOW(msg);
      break;

    case process.env.REACT_REDUX_STATE:
      messHandlers.handleREDUX_STATE(msg);
      break;

    case process.env.REACT_REQUEST_REDUX_INITIAL_STATE:
      messHandlers.handleREQUEST_REDUX_INITIAL_STATE();
      break;
    
    case process.env.REACT_REQUEST_PAGE_NAME:
      messHandlers.handleREQUEST_PAGE_NAME();
      break;
      
  }  
};
