import { process } from './d_generated/plugin-globals'


export async function showUI(page) {
    let crtPage = '';
    let uiPage = __uiFiles__.main;
    
    switch (page) {
        case 'main':
            uiPage = __uiFiles__.main;
            crtPage = 'main';
            break;

        case 'secondary':
            uiPage = __uiFiles__.secondary;
            crtPage = 'secondary';
            break;
        
        default:
            uiPage = __uiFiles__.main;
            crtPage = 'main';
            break;
    }
    
    const storageKeys = await figma.clientStorage.keysAsync();
    if (!storageKeys.includes('size')) await figma.clientStorage.setAsync('size', {
        h: parseInt(process.env.REACT_WINDOW_SIZE_H), 
        w: parseInt(process.env.REACT_WINDOW_SIZE_W)
    });

    const savedSize = await figma.clientStorage.getAsync('size');
    if (savedSize) {
            figma.showUI(uiPage, { 
                themeColors: false, 
                height: savedSize.h, 
                width: savedSize.w 
            });
        }
    else {
            figma.showUI(uiPage, { 
                themeColors: false, 
                height: parseInt(process.env.REACT_WINDOW_SIZE_H), 
                width: parseInt(process.env.REACT_WINDOW_SIZE_W)
            });
    }

    return crtPage;
    /* IMPORTANT!!!!
     * here we cannot send messages to react because we may break 
     * the transmission of the persistent redux state

    figma.ui.postMessage({
        type: process.env.REACT_UI_INIT, 
        data:'ui is live'
    });
    */

}

export function showPluginOpenButton() {
    figma.root.setRelaunchData({open: ""});
}

export function initUI() {
    showPluginOpenButton();
    showUI('main');
    /*
    .then (()=> {
        figma.ui.postMessage({
            type: process.env.PAGE_NAME, 
            data: 'main'
          });
    })
    */    
}