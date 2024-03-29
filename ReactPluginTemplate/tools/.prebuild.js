const  {packPagesWithApp, dynamicCode} = require('./utilities')

console.clear();

// START PREBUILD
console.info('RUNNING PREBUILD ...');

console.info('RUNNING PREBUILD ... INIT ENV');
// adding .env vars to each html
dynamicCode (
    'html',
    'envVar',
    './templates/common.before.html', 
    '<!---- MARKER FOR ENV VARIABLES ---->',
    '<!---- END ENV VARIABLES ---->'
);

// adding .env vars to src/modules/d_generated/plugin-globals.js
// in order to allow code.ts and other modules to import env variables
dynamicCode (
    'code',
    'envVar', 
    './src/modules/d_generated/plugin-globals.js', 
    '//dynamic generated code',
    '//end dynamic generated code'
);

console.info('RUNNING PREBUILD ... ADD INLINE STYLES');
dynamicCode (
    'html',
    'customBootstrap', 
    './templates/common.after.html', 
    '<!---- MARKER FOR CUSTOM STYLES ---->',
    '<!---- END CUSTOM STYLES ---->'
);


console.info('RUNNING PREBUILD ... UPDATE WEBPACK');
// WEBPACK.CONFIG.JS UPDATE
// adding html pages to webpack to bundle the react app in each page
packPagesWithApp('/* ----- MARKER FOR PAGES ---- */')

// END PREBUILD
