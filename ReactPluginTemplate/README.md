# REACT Figma Plugin Template
This is a template for a REACT based Figma Plugin. 
For using this template follow the steps below:
1. copy all files in a new folder, modify package.json, package-lock.json, manifest.json and tsconfig.json to reflect your plugin name
2. see https://www.figma.com/plugin-docs/plugin-quickstart-guide/ to install and configure TypeScript, npm ...
3. see https://www.figma.com/plugin-docs/libraries-and-bundling/ to install and configure webpack
4. run 'npm run build' to build/pack the plugin in code.js after any modification

**IMPORTANT!!!**
1. Is not indicated to setup watch and build when files are modified since building may take a while.
2. .env doesn't contain sensitive info, so there is only one .env file, not separated for dev and prod. Also .env is visible in the repo, is not included in .gitignore. Should stay like this, otherwise build will fail or the plugin will not work well.
3. any modification of the webpack.config.js shall be made in ./templates/template_webpack.config.js, otherwise will be removed when adding the dynamic part of webpack.config.js at build time

**We like OOP and classes, so the React App is based on class components, but feel free to use functional components in your development (REDUX stuff was not intensive tested on functional components, but there are no reasons for not performing well)**

<!-- START_EXPOSED_SECTION -->
# Features
1. REACT Redux support and boilerplate code are included
2. Support for multi html pages is included
3. Support for common html code to be appended/prepended to plugin html pages is included (this is the way to load external scripts/styles that are needed in each plugin html page)
4. Support for plugin page resize and save last size is included
5. Support for Redux middleware included together with boilerplate code
6. Support for .env is included, env variables can be used in the same way everywhere (ui, code.ts, react app/components) with the syntax process.env.<env_var_name>
7. Support for store persistance in figma.clienStorage is included (be aware of 1MB size restriction of figma.clientStorage )
8. Support for creating external resources to be loaded in the plugin is included. Scripts, styles, assets can be published on npm to be further used in Figma plugin
<!-- END_EXPOSED_SECTION -->