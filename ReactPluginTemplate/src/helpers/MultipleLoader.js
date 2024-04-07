class MultipleLoader {

    constructor(what) {
        this.imports = this.getImports(what);
        this.output = this.getOutput(this.imports);

    }

    getOutput(i) {
        let out = {};
        Object.keys(i).forEach((key) => {
            out = { ...out, ...i[key] };
        });
        return out;
    }

    getImports(w) {

        switch (w) {
            case 'reducers':
                return this.importAll(require.context('../redux-reducers/', false, /^(?!.*(?:reducers-index.js$)).*.js$/));
            
            case 'actions':
                return this.importAll(require.context('../redux-actions/', false, /^(?!.*(?:types.js$)).*.js$/));
            
            case 'components': 
                return this.importAll(require.context('../components/', false, /\.(js|jsx|tsx)$/));

            case 'middleware': 
                return this.importAll(require.context('../redux-middleware/', false, /\.(js|jsx|tsx)$/));

            case 'dynamic_code': 
                return this.importAll(require.context('../modules/d_generated/', false, /\.(js|jsx|tsx|ts)$/));
            
            default: return;
        }

    }

    importAll(r) {
        return r.keys().map(r);
    }
}

export default MultipleLoader;