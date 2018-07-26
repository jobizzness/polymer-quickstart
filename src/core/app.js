import { CONFIG } from '../../config.js';

window.__APP__ = window.__APP__ || new class {

    get config() {
        return CONFIG;
    }

    constructor() {
        
            this.element = this.config.APP_ELEMENT
            ? document.querySelector('remi-app')
            : null
        
    }

}();


export const App = window.__APP__;