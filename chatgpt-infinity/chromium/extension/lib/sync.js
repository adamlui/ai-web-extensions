// Requires lib/<settings|styles>.js + toolbarMenu.refresh() (Greasemonkey only)

window.sync = {
    configToUI: async function(options) { // on toolbar popup toggles + ChatGPT tab activations
        await settings.load('extensionDisabled', ...Object.keys(settings.controls))
        toggles.sidebar.update.state() // from extension/IM/TV toggled or tab newly active
        if (options?.updatedKey == 'infinityMode') infinity[config.infinityMode ? 'activate' : 'deactivate']()
        else if (settings.controls[options?.updatedKey]?.type == 'prompt' && config.infinityMode)
            infinity.restart({ target: options?.updatedKey == 'replyInterval' ? 'self' : 'new' })
        else if (/notifBottom|toastMode/.test(options?.updatedKey)) styles.update({ key: 'toast' })
        if (typeof GM_info != 'undefined') toolbarMenu.refresh() // prefixes/suffixes
    }
};
