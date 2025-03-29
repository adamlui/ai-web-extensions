// Requires app (Greasemonkey only) + site: env.site + sites

window.config = {}
window.settings = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    get browserwideKeys() {
        return [ 'extensionDisabled', 'fullscreen',
            ...Object.keys(this.imports.sites).map(site => `${site}Disabled`) ]
    },

    controls: { // displays top-to-bottom in toolbar menu
        get fullerWindows() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_fullerWins'),
            helptip: settings.getMsg('helptip_fullerWins')
        }},
        get tcbDisabled() { return { type: 'toggle', symbol: '↕️', defaultVal: false,
            label: settings.getMsg('menuLabel_tallerChatbox'),
            helptip: settings.getMsg('helptip_tallerChatbox')
        }},
        get widerChatbox() { return { type: 'toggle', symbol: '↔️', defaultVal: false,
            label: settings.getMsg('menuLabel_widerChatbox'),
            helptip: settings.getMsg('helptip_widerChatbox')
        }},
        get ncbDisabled() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_newChatBtn'),
            helptip: settings.getMsg('helptip_newChatBtn')
        }},
        get hiddenHeader() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_hiddenHeader'),
            helptip: settings.getMsg('helptip_hiddenHeader')
        }},
        get hiddenFooter() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_hiddenFooter'),
            helptip: settings.getMsg('helptip_hiddenFooter')
        }},
        get btnAnimationsDisabled() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_btnAnimations'),
            helptip: settings.getMsg('helptip_btnAnimations')
        }},
        get notifDisabled() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_modeNotifs'),
            helptip: settings.getMsg('helptip_modeNotifs')
        }},
        get blockSpamDisabled() { return { type: 'toggle', defaultVal: false,
            label: settings.getMsg('menuLabel_blockSpam'),
            helptip: settings.getMsg('helptip_blockSpam')
        }}
    },

    categories: {
        get siteSettings() { return {
            label: settings.getMsg('menuLabel_siteSettings'),
            helptip: `${settings.getMsg('helptip_enableDisable')} ${settings.getMsg('appName')} `
                      + settings.getMsg('helptip_perSite')
        }}
    },

    getMsg(key) {
        this._msgKeys ??= new Map() // to cache keys for this.isEnabled() inversion logic
        const msg = typeof GM_info != 'undefined' ? this.imports.app.msgs[key] : chrome.i18n.getMessage(key)
        this._msgKeys.set(msg, key)
        return msg
    },

    isEnabled(key) {
        const reInvertFlags = /disabled|hidden/i
        return reInvertFlags.test(key) // flag in control key name
            && !reInvertFlags.test(this._msgKeys.get(this.controls[key]?.label) || '') // but not in label msg key name
                ? !config[key] : config[key] // so invert since flag reps opposite state, else don't
    },

    load(...keys) {
        keys = keys.flat() // flatten array args nested by spread operator
        if (typeof GM_info != 'undefined') // synchronously load from userscript manager storage
            keys.forEach(key => config[key] = GM_getValue(
                !this.browserwideKeys.includes(key) ? `${this.imports.app.configKeyPrefix}_${key}` : key,
                this.controls[key]?.defaultVal ?? this.controls[key]?.type == 'toggle'
            ))
        else // asynchronously load from browser extension storage
            return Promise.all(keys.map(async key => { // resolve promise when all keys load
                const result = await chrome.storage.local.get(
                    !this.browserwideKeys.includes(key) ? `${this.imports.site}_${key}` : key )
                config[key] = result[`${this.imports.site}_${key}`] ?? result[key]
                    ?? this.controls[key]?.defaultVal ?? this.controls[key]?.type == 'toggle'
        }))
    },

    save(key, val) {
        if (typeof GM_info != 'undefined') // save to userscript manager storage
            GM_setValue(!this.browserwideKeys.includes(key) ? `${this.imports.app.configKeyPrefix}_${key}` : key, val)
        else // save to browser extension storage
            chrome.storage.local.set({
                [ !this.browserwideKeys.includes(key) ? `${this.imports.site}_${key}` : key ] : val })
        config[key] = val // save to memory
    }
};
