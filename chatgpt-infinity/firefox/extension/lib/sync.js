// Requires lib/<settings|styles>.js + toolbarMenu.refresh() (Greasemonkey only)

window.sync = {
    configToUI: async function({ updatedKey } = {}) { // on toolbar popup toggles + ChatGPT tab activations
        await settings.load('extensionDisabled', Object.keys(settings.controls))
        toggles.sidebar.update.state() // from extension/IM/TV toggled or tab newly active
        if (updatedKey == 'infinityMode') infinity[app.config.infinityMode ? 'activate' : 'deactivate']()
        else if (settings.controls[updatedKey]?.type == 'prompt' && app.config.infinityMode)
            infinity.restart({ target: updatedKey == 'replyInterval' ? 'self' : 'new' })
        else if (/notifBottom|toastMode/.test(updatedKey)) styles.update({ key: 'toast' })
        if (typeof GM_info != 'undefined') toolbarMenu.refresh() // prefixes/suffixes
    }
};
