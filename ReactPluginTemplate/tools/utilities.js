const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // eslint-disable-next-line
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

function getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.map((dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    });
    return files.flat();
}

function getPagesForWebpack() {
    let pageListObj = '';
    let header = '\n/* Start plugin html files */';
    let footer = '\n/* End plugin html files */\n';
    let pageNo = 0;
    
    fs.mkdir('./src/html/build', { recursive: true }, (err) => {
      if (err) throw err;
    });
  
    getFiles('./src/html').forEach(page => {
      let file = path.basename(page);
      let src = `./src/html/${file}`;
      let dest = `./src/html/build/${file}`;
      fs.copyFile(src, dest, (err) => {
        if (err) throw err;
      });
  
      fs.readFile('./templates/common.before.html', 'utf8', (err, commonBeforeHTML) => {
        if (err) throw err;
        fs.readFile('./templates/common.after.html', 'utf8', (err, commonAfterHTML) => {
          if (err) throw err;
          fs.readFile(dest, 'utf8', (err, fileHTML) => {
            if (err) throw err;
            let fullContent = commonBeforeHTML + '\n\n' + fileHTML + '\n\n' + commonAfterHTML;
            fs.writeFile(dest, fullContent, err => {
              if (err) throw err;
              console.info(dest + ' updated and ready for packing');
            });
          });    
        });
      });
    });
    
    if (fs.statSync("./src/html/build").isDirectory()) {

      const pageArray = getFiles('./src/html/build');
      pageNo = pageArray.length;
      pageArray.forEach(page => {
        let fullPage = page;
        const shortName = path.parse(page).name; 
        let fileName = path.basename(page);
        let pageObj1 = `\n\n/*${fileName}*/\nnew HtmlWebpackPlugin({\n\tinject: 'body',\n\ttemplate: './${fullPage}',\n\tfilename: '${fileName}',\n\tchunks: ['ui']\n}),\n\n`;
  
        let pageObj2 = `\nnew HtmlInlineScriptPlugin({\n\thtmlMatchPattern: [/${fileName}/],\n\tscriptMatchPattern: [/.js$/]\n}),`;
        
        let pageObj = pageObj1+pageObj2;
        pageListObj = pageListObj+pageObj;
  
      });
    }
    return {justList:pageListObj, fullList: header + pageListObj + footer, pages: pageNo};
}
    
const packPagesWithApp = async (marker) => {    
    fs.readFile('./templates/template_webpack.config.js', 'utf8', (err, webpackTemplate) => {
      if (err) throw err;
      let pagesForWebpack = getPagesForWebpack();
      if (pagesForWebpack.justList !== '') {
        const content = webpackTemplate.replace(marker,pagesForWebpack.fullList);
  
        fs.writeFile('webpack.config.js', content, err => {
          if (err) throw err;
          console.info(`** webpack.config.js updated, ${pagesForWebpack.pages} pages added for packing`);
        });
      }
    });
}

function prepareENVVars() {
    // Load .env file
    const envConfig = dotenv.parse(fs.readFileSync('./.env'));

    const envData = {env:envConfig};
    let envDataStringHTML = 
        '\n' + 
        '<!---- MARKER FOR ENV VARIABLES ---->\n' +
        '<script>\nconst process = ' +
        JSON.stringify(envData).
            replace(/,/g,',\n').
            replace(/{"/g ,'{\n"').
            replace(/"}}/g, '"\n}\n}') +
        '\n</script>\n' +
        '<!---- END ENV VARIABLES ---->\n';

      let envDataStringCode = 
        '//dynamic generated code\n' +
        JSON.stringify(envData).
        replace(/,/g,',\n').
        replace(/{"/g, '{').
        replace(/":/g, ':').
        replace(/"REACT_/g, 'REACT_').
        replace(/{env/g, '\tenv').
        replace(/}}/g, '}').
        replace(/{REACT_/g, '{\nREACT_').
        replace(/REACT_/g, '\t\tREACT_').
        replace(/}/g,'\n\t}') +
        '\n//end dynamic generated code\n';
      
    return { html: envDataStringHTML, code: envDataStringCode };
}

function prepareCustomStyles() {
  let cssFiles = getFiles('./src/css/global');
  let inlineCss = ''
  cssFiles.forEach( (file) => {
    const fileCss = `\n/* styles from ${file} */\n` + fs.readFileSync(file) + '\n';
    inlineCss += fileCss;

  });
  
  //let customBootstrap = fs.readFileSync('./src/css/global/bootstrap-custom.css');
  
  const inlineCssHTML = 
      '\n\n<!---- MARKER FOR CUSTOM STYLES ---->\n' +
      '<style>\n' +
      inlineCss +
      '\n</style>\n' +
      '<!---- END CUSTOM STYLES ---->\n'
  
  const inlineCssCode = '';
  
  return { html: inlineCssHTML, code: inlineCssCode };  
}

function getCode(what) {
  switch (what) {
    case 'envVar':
      return prepareENVVars();
    case 'customBootstrap':
      return prepareCustomStyles();

  }
}

function dynamicCode(callType, whatCode, file, markerStart, markerEnd) {
    let dynamicCode = callType ==='html' 
      ? getCode(whatCode).html
      : getCode(whatCode).code;

    //console.log(dynamicCode);

    if (dynamicCode && dynamicCode !== '') {
      let buffer = fs.readFileSync(file);
      let copiedBuf = Uint8Array.prototype.slice.call(buffer);
      let startIndex = copiedBuf.indexOf(markerStart);
      copiedBuf = [copiedBuf.slice(0, startIndex), '<!---- TEMP MARKER ---->', copiedBuf.slice(startIndex)].join('');

      let endIndex = copiedBuf.indexOf(markerEnd) + markerEnd.length;
      copiedBuf = [copiedBuf.slice(0, endIndex), '<!---- END TEMP MARKER ---->', copiedBuf.slice(endIndex)].join('');

      startIndex = copiedBuf.indexOf(markerStart);
      endIndex = copiedBuf.indexOf('<!---- END TEMP MARKER ---->');

      let code = copiedBuf.substr(startIndex, endIndex-startIndex);
      copiedBuf = copiedBuf.replace(code,'');
      copiedBuf = copiedBuf.replace('<!---- TEMP MARKER ----><!---- END TEMP MARKER ---->',dynamicCode)
      copiedBuf = copiedBuf.replace(/\n\n/g,'\n');

      fs.writeFileSync(file, copiedBuf);
    }
}

exports.packPagesWithApp = packPagesWithApp;
exports.dynamicCode = dynamicCode;
exports.uuid = uuid;
