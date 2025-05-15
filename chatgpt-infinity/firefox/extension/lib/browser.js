
window.browserAPI = {
    getMsg(key) {
        return /Chromium|Firefox/.test(this.runtime) ?
            chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
                : app.msgs[key] // from userscript
    },

    get runtime() {
        return typeof GM_info != 'undefined' ? 'Greasemonkey userscript'
             : typeof chrome != 'undefined' && chrome.runtime ? (
                    typeof browser != 'undefined' ? 'Firefox add-on'
                    : `Chromium ${ navigator.userAgent.includes('Edg') ? 'Edge add-on' : 'extension' }`
           ) : 'unknown'
    }
};
