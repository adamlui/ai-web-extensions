// Requires lib/<settings|styles>.js + checkBtnsToClick() + toolbarMenu.refresh() (Greasemonkey only)

window.sync = {
    configToUI: async function(options) { // on toolbar popup toggles + ChatGPT tab activations
        await settings.load('extensionDisabled', Object.keys(settings.controls))
        if (!config.extensionDisabled && !checkBtnsToClick.active) checkBtnsToClick()
        if (/notifBottom|toastMode/.test(options?.updatedKey)) styles.update({ key: 'toast' })
        if (typeof GM_info != 'undefined') toolbarMenu.refresh() // prefixes/suffixes
    }
};
