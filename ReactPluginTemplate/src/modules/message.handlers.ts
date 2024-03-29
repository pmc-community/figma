import * as uiHandlers from './ui.handlers';
import { process } from './d_generated/plugin-globals'

let crtPage = ''

export async function handleCREATE_RECTANGLES(rectangleNo) {
    const nodes = [];

    for (let i = 0; i < rectangleNo; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    
    crtPage = await uiHandlers.showUI('secondary');
}

export async function handleNAVIGATE_MAIN() {
    crtPage = await uiHandlers.showUI('main');
}

export async function handleNAVIGATE_SECONDARY() {
    crtPage = await uiHandlers.showUI('secondary');
}


export function handleCLOSE_PLUGIN() {
    figma.closePlugin();
}

export async function handleRESIZE_PLUGIN_WINDOW(msg) {
    figma.ui.resize(msg.size.w,msg.size.h); 
    await figma.clientStorage.setAsync('size', msg.size);
    
    /* IMPORTANT !!!
     * here we can send messages to react app because the redux state was loaded already
     * AS GENERAL RULE, IT IS SAFE TO SEND MESSAGES FROM CODE.TS TO REACT ONLY WHEN WE ARE 100%
     * SURE THAT THE UI IS LOADED, ,EANING THAT THE STORE PERSISTENT STATE WAS LOADED
     */
    
    /*
    figma.ui.postMessage({
        type: process.env.REACT_UI_INIT, 
        data:'ui resized'
    });
    */
    
}

export async function handleREDUX_STATE(msg) {
   
    await figma.clientStorage.setAsync('reduxState', msg.crtState); // save current redux state
    
     //here we can send message to UI since UI is active
    figma.ui.postMessage({
        type:process.env.REACT_UI_REDUX_SAVED, 
        data:'redux state saved',
        state: msg.crtState
    });
    
}

export async function handleREQUEST_PAGE_NAME() {
   
    const pageName = crtPage; 
     //here we can send message to UI since UI is active
     figma.ui.postMessage({
        type: process.env.PAGE_NAME, 
        data: pageName
     });
    
}

export async function handleREQUEST_REDUX_INITIAL_STATE() {
    const storageKeys = await figma.clientStorage.keysAsync();
    if (storageKeys.includes('reduxState'))
        figma.ui.postMessage({
            type: process.env.REACT_STORE_INITIAL_STATE, 
            data: await figma.clientStorage.getAsync('reduxState')
        });
    else
        figma.ui.postMessage({
            type: process.env.REACT_STORE_INITIAL_STATE, 
            data: {}
        });
}