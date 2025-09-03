// Requires components/buttons.js + lib/<browser|chatbar|settings|styles>.js +  <config|env> + notify()

window.sync = {

    async configToUI(options) { // on toolbar popup toggles + AI tab activations
    // ... requires components/buttons.js + lib/<chatbar|settings|styles>.js + <config|env>

        const { site } = env, extensionWasDisabled = config.extensionDisabled || config[`${site}Disabled`]
        await settings.load('extensionDisabled', settings.siteDisabledKeys, sites[site].availFeatures)
        if (!extensionWasDisabled && ( config.extensionDisabled || config[`${site}Disabled`] )) { // reset UI
            [styles.chatbar.node, styles.tweaks.node, styles.widescreen.node, styles.fullWin.node, buttons]
                .forEach(target => target?.remove())
            chatbar.reset()
            if (site == 'chatgpt') document.body.removeEventListener('wheel', window.enableWheelScroll)
        } else if (!config.extensionDisabled && !config[`${site}Disabled`]) { // sync modes/tweaks/btns
            if (config.widescreen ^ styles.widescreen.node?.isConnected) { // sync Widescreen
                suppressNotifs() ; toggleMode('widescreen') }
            if (sites[site].hasSidebar && ( config.fullWindow ^ await ui.isFullWin() )) { // sync Full-Window
                suppressNotifs() ; toggleMode('fullWindow') }
            styles.update({ keys: ['chatbar', 'tweaks', 'widescreen'] }) // sync HH/HF/TCB/WCB/NCB/BA/WW
            chatbar.tweak() // update ChatGPT chatbar inner width or hack Poe btn pos
            buttons[config.btnsVisible ? 'insert' : 'remove']() // update button visibility
            if (options?.updatedKey == 'btnAnimationsDisabled' && !config.btnAnimationsDisabled)
                buttons.animate() // to visually signal location + preview fx applied by Button Animations toggle-on
            else if (/notifBottom|toastMode/.test(options?.updatedKey)) styles.update({ key: 'toast' })
            if (site == 'chatgpt') // toggle free wheel locked in some Spam blocks
                document.body[`${ config.blockSpamDisabled ? 'remove' : 'add' }EventListener`](
                    'wheel', window.enableWheelScroll)
        }

        function suppressNotifs() {
            if (config.notifDisabled) return
            settings.save('notifDisabled', true) // suppress notifs for cleaner UI
            setTimeout( // ...temporarily
                () => settings.save('notifDisabled', false), options?.updatedKey == 'widescreen' ? 1 : 15)
        }
    },

    async mode(mode) { // setting + icon + chatbar
        const state = ( mode == 'widescreen' ? styles.widescreen.node?.isConnected
                      : mode == 'fullWindow' ? await ui.isFullWin()
                      : chatgpt.isFullScreen() )
        settings.save(mode, state) ; buttons.update.svg(mode)
        if (!config.extensionDisabled && !config[`${env.site}Disabled`]) { // tweak UI
            if (env.site == 'chatgpt') setTimeout(() => chatbar.tweak(), // update inner width
                mode == 'fullWindow' && config.widescreen && config.widerChatbox ?
                    111 : 0) // delay if toggled to/from active WCB to avoid wrong width
            if (config.widerChatbox) styles.update({ key: 'chatbar' }) // sync WCB
            notify(`${browserAPI.getMsg('mode_' + mode)} ${
                      browserAPI.getMsg(`state_${ state ? 'on' : 'off' }`).toUpperCase()}`)
        }
        if (typeof GM_info != 'undefined') toolbarMenu.refresh()
        config.modeSynced = true ; setTimeout(() => config.modeSynced = false, 100) // prevent repetition
    }
};
