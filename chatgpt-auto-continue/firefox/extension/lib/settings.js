// Requires app (Greasemonkey only)

window.config = {}
window.settings = {

    categories: {
        get notifSettings() { return {
            symbol: '📣',
            color: '16e4f7', // teal
            label: `${settings.getMsg(`menuLabel_notif`)} ${settings.getMsg(`menuLabel_settings`)}`,
            helptip: `${settings.getMsg('helptip_adjustSettingsRelatedTo')} ${
                        settings.getMsg('menuLabel_modeNotifs').toLowerCase()}`
        }}
    },

    controls: { // displays top-to-bottom in toolbar menu
        get autoScroll() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_autoScroll'),
            helptip: settings.getMsg('helptip_autoScroll')
        }},
        get notifDisabled() { return { type: 'toggle', defaultVal: false, category: 'notifSettings',
            label: settings.getMsg('menuLabel_modeNotifs'),
            helptip: settings.getMsg('helptip_modeNotifs')
        }},
        get notifBottom() { return {
            type: 'toggle', defaultVal: false, category: 'notifSettings',
            label: `${settings.getMsg('menuLabel_anchor')} ${settings.getMsg('menuLabel_notifs')}`,
            helptip: settings.getMsg('helptip_notifBottom')
        }},
        get toastMode() { return {
            type: 'toggle', defaultVal: false, category: 'notifSettings',
            label: settings.getMsg('mode_toast'),
            helptip: settings.getMsg('helptip_toastMode')
        }}
    },

    getMsg(key) {
        this.msgKeys ??= new Map() // to cache keys for this.isEnabled() inversion logic
        const msg = typeof GM_info != 'undefined' ? app.msgs[key] : chrome.i18n.getMessage(key)
        this.msgKeys.set(msg, key)
        return msg
    },

    typeIsEnabled(key) { // for menu labels + notifs to return ON/OFF for type w/o suffix
        const reInvertFlags = /disabled|hidden/i
        return reInvertFlags.test(key) // flag in control key name
            && !reInvertFlags.test(this.msgKeys.get(this.controls[key]?.label) || '') // but not in label msg key name
                ? !app.config[key] : app.config[key] // so invert since flag reps opposite type state, else don't
    },

    load(...keys) {
        keys = keys.flat() // flatten array args nested by spread operator
        if (typeof GM_info != 'undefined') // synchronously load from userscript manager storage
            keys.forEach(key => app.config[key] = processKey(key, GM_getValue(`${app.configKeyPrefix}_${key}`, undefined)))
        else // asynchronously load from browser extension storage
            return Promise.all(keys.map(async key =>
                app.config[key] = processKey(key, (await chrome.storage.local.get(key))[key])))
        function processKey(key, val) {
            const ctrl = settings.controls?.[key]
            if (val != undefined && ( // validate stored val
                    (ctrl?.type == 'toggle' && typeof val != 'boolean')
                    || (ctrl?.type == 'slider' && isNaN(parseFloat(val)))
            )) val = undefined
            return val ?? (ctrl?.defaultVal ?? (ctrl?.type == 'slider' ? 100 : false))
        }
    },

    save(key, val) {
        if (typeof GM_info != 'undefined') // save to userscript manager storage
            GM_setValue(`${app.configKeyPrefix}_${key}`, val)
        else // save to browser extension storage
            chrome.storage.local.set({ [key]: val })
        app.config[key] = val // save to memory
    }
};
