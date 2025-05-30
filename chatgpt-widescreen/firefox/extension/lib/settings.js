// Requires app (Greasemonkey only) + env.site + sites

window.config = {}
window.settings = {

    get browserwideKeys() {
        return [ 'extensionDisabled', 'fullscreen',
            ...Object.keys(sites).map(site => `${site}Disabled`) ]
    },

    categories: {
        get btnSettings() { return {
            symbol: '🔘',
            color: 'a80104', // red
            label: `${settings.getMsg(`menuLabel_btn`)} ${settings.getMsg(`menuLabel_settings`)}`,
            helptip: `${settings.getMsg('helptip_adjustSettingsRelatedTo')} ${
                        settings.getMsg('helptip_btns').toLowerCase()}`
        }},
        get chatboxSettings() { return {
            symbol: '📤',
            color: '1e5919', // green
            label: `${settings.getMsg(`menuLabel_chatbox`)} ${settings.getMsg(`menuLabel_settings`)}`,
            helptip: `${settings.getMsg('helptip_adjustSettingsRelatedTo')} ${
                        settings.getMsg('helptip_the').toLowerCase()} ${
                        settings.getMsg('menuLabel_chatbox').toLowerCase()}`
        }},
        get displaySettings() { return {
            symbol: '🖥️', autoExpand: true,
            color: '856cb7', // purple
            label: `${settings.getMsg(`menuLabel_display`)} ${settings.getMsg(`menuLabel_settings`)}`,
            helptip: `${settings.getMsg('helptip_adjustSettingsRelatedTo')} ${
                        settings.getMsg('helptip_the').toLowerCase()} ${
                        settings.getMsg('menuLabel_display').toLowerCase()}`
        }},
        get notifSettings() { return {
            symbol: '📣',
            color: '16e4f7', // teal
            label: `${settings.getMsg(`menuLabel_notif`)} ${settings.getMsg(`menuLabel_settings`)}`,
            helptip: `${settings.getMsg('helptip_adjustSettingsRelatedTo')} ${
                        settings.getMsg('menuLabel_modeNotifs').toLowerCase()}`
        }},
        get siteSettings() { return {
            symbol: '🌐',
            label: settings.getMsg('menuLabel_siteSettings'),
            helptip: `${settings.getMsg('helptip_enableDisable')} ${settings.getMsg('appName')} ${
                        settings.getMsg('helptip_perSite')}`
        }}
    },

    controls: { // displays top-to-bottom in toolbar menu
        get widescreenWidth() { return {
            type: 'slider', symbol: '↔️', defaultVal: 100, category: 'displaySettings',
            label: `${settings.getMsg('mode_widescreen')} ${settings.getMsg('menuLabel_width')}`, labelSuffix: '%',
            helptip: settings.getMsg('helptip_widescreenWidth'),
            excludes: { env: ['greasemonkey'] }
        }},
        get widescreen() { return {
            type: 'toggle', defaultVal: true, category: 'displaySettings',
            label: settings.getMsg('mode_widescreen'),
            excludes: { env: ['greasemonkey'] }
        }},
        get fullWindow() { return {
            type: 'toggle', defaultVal: false, category: 'displaySettings',
            label: settings.getMsg('mode_fullWindow'),
            excludes: { env: ['greasemonkey'] }
        }},
        get tcbDisabled() { return {
            type: 'toggle', symbol: '↕️', defaultVal: true, category: 'chatboxSettings',
            label: `${settings.getMsg('menuLabel_taller')} ${settings.getMsg('menuLabel_chatbox')}`,
            helptip: settings.getMsg('helptip_tallerChatbox')
        }},
        get widerChatboxWidth() { return {
            type: 'slider', symbol: '↔️', defaultVal: 100, category: 'chatboxSettings',
            label: `${settings.getMsg('menuLabel_wider')} ${settings.getMsg('menuLabel_chatbox')} ${
                      settings.getMsg('menuLabel_width')}`,
            labelSuffix: '%',
            helptip: settings.getMsg('helptip_widerChatboxWidth'),
            excludes: { env: ['greasemonkey'] }
        }},
        get widerChatbox() { return {
            type: 'toggle', symbol: '↔️', defaultVal: false, category: 'chatboxSettings',
            label: `${settings.getMsg('menuLabel_wider')} ${settings.getMsg('menuLabel_chatbox')}`,
            helptip: settings.getMsg('helptip_widerChatbox')
        }},
        get ncbDisabled() { return {
            type: 'toggle', defaultVal: false, category: 'btnSettings',
            label: settings.getMsg('menuLabel_newChatBtn'),
            helptip: settings.getMsg('helptip_newChatBtn')
        }},
        get hiddenHeader() { return {
            type: 'toggle', defaultVal: false, category: 'displaySettings',
            label: settings.getMsg('menuLabel_hiddenHeader'),
            helptip: settings.getMsg('helptip_hiddenHeader')
        }},
        get hiddenFooter() { return {
            type: 'toggle', defaultVal: false, category: 'displaySettings',
            label: settings.getMsg('menuLabel_hiddenFooter'),
            helptip: settings.getMsg('helptip_hiddenFooter')
        }},
        get btnAnimationsDisabled() { return {
            type: 'toggle', defaultVal: false, category: 'btnSettings',
            label: settings.getMsg('menuLabel_btnAnimations'),
            helptip: settings.getMsg('helptip_btnAnimations')
        }},
        get btnsVisible() { return {
            type: 'toggle', defaultVal: true, category: 'btnSettings',
            label: settings.getMsg('menuLabel_btnVisibility'),
            helptip: settings.getMsg('helptip_btnVisibility')
        }},
        get notifDisabled() { return {
            type: 'toggle', defaultVal: false, category: 'notifSettings',
            label: `${settings.getMsg('menuLabel_show')} ${settings.getMsg('menuLabel_notifs')}`,
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
        }},
        get blockSpamDisabled() { return {
            type: 'toggle', defaultVal: false, category: 'displaySettings',
            label: settings.getMsg('menuLabel_blockSpam'),
            helptip: settings.getMsg('helptip_blockSpam')
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
                ? !config[key] : config[key] // so invert since flag reps opposite type state, else don't
    },

    load(...keys) {
        keys = keys.flat() // flatten array args nested by spread operator
        if (typeof GM_info != 'undefined') // synchronously load from userscript manager storage
            keys.forEach(key => config[key] = GM_getValue(
                !this.browserwideKeys.includes(key) ? `${app.configKeyPrefix}_${key}` : key, initDefaultVal(key)))
        else // asynchronously load from browser extension storage
            return Promise.all(keys.map(async key => { // resolve promise when all keys load
                const result = await chrome.storage.local.get(
                    !this.browserwideKeys.includes(key) ? `${env.site}_${key}` : key )
                config[key] = result[`${env.site}_${key}`] ?? result[key] ?? initDefaultVal(key)
            }))
        function initDefaultVal(key) {
            const ctrlData = settings.controls?.[key]
            return ctrlData?.defaultVal ?? ( ctrlData?.type == 'slider' ? 100 : ctrlData?.type == 'toggle' )
        }
    },

    save(key, val) {
        if (typeof GM_info != 'undefined') // save to userscript manager storage
            GM_setValue(!this.browserwideKeys.includes(key) ? `${app.configKeyPrefix}_${key}` : key, val)
        else // save to browser extension storage
            chrome.storage.local.set({
                [ !this.browserwideKeys.includes(key) ? `${env.site}_${key}` : key ] : val })
        config[key] = val // save to memory
    }
};
