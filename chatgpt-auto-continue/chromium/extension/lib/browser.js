
window.browserAPI = {
    getMsg(key) {
        return typeof GM_info == 'undefined' ?
            chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
                : app.msgs[key] // from userscript
    }
};
