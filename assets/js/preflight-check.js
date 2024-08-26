// we should assume that no script is loaded
// so, no jQuery or something else

const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName, fullVersion;

    if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Mozilla Firefox';
        fullVersion = userAgent.substring(userAgent.indexOf('Firefox/') + 8);
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
        browserName = 'Opera';
        fullVersion = userAgent.substring(userAgent.indexOf('OPR/') + 4);
    } else if (userAgent.indexOf('Edg') > -1) {
        browserName = 'Microsoft Edge';
        fullVersion = userAgent.substring(userAgent.indexOf('Edg/') + 4);
    } else if (userAgent.indexOf('Chrome') > -1) {
        browserName = 'Google Chrome';
        fullVersion = userAgent.substring(userAgent.indexOf('Chrome/') + 7);
    } else if (userAgent.indexOf('Safari') > -1) {
        browserName = 'Safari';
        fullVersion = userAgent.substring(userAgent.indexOf('Version/') + 8);
    } else if (userAgent.indexOf('MSIE') > -1 || !!document.documentMode == true) {
        browserName = 'Internet Explorer';
        fullVersion = userAgent.substring(userAgent.indexOf('MSIE') + 5);
    } else {
        browserName = 'Unknown';
        fullVersion = 'Unknown';
    }

    return {
        browserName: browserName,
        fullVersion: fullVersion.split(' ')[0]
    };
}
let goodToGo = true;
let browser = getBrowserInfo();
let text = '';
if (browser.browserName === 'Safari' || browser.browserName === 'Internet Explorer') {
    goodToGo = false;
    text = `Sorry, we do not support ${browser.browserName} ${browser.fullVersion}`;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!goodToGo) {
        const errDiv = document.createElement('div');
        const errText = document.createElement('h2');
        errText.textContent = text;
        errText.style.width = '100vw';
        errText.style.height = '100vh';
        errText.style.justifyContent = 'center';
        errText.style.alignItems = 'center';
        errText.style.display = 'flex'
        errDiv.appendChild(errText);
        document.body.appendChild(errDiv);
    
        toRemove = document.querySelector('.main');
        toRemove.remove();
        toRemove = document.querySelector('.side-bar');
        toRemove.remove();
    
        document.body.style.visibility = 'visible';
    }
    
});