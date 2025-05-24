// Requires components/buttons.js + lib/<browser|chatbar|settings|styles>.js +  <config|env> + notify()

window.sync = {

    async configToUI(options) { // on toolbar popup toggles + AI tab activations
    // ... requires components/buttons.js + lib/<chatbar|settings|styles>.js + <config|env>

        const { site } = env, extensionWasDisabled = config.extensionDisabled || config[`${site}Disabled`]
        await settings.load('extensionDisabled', ...settings.siteDisabledKeys, ...sites[site].availFeatures)
        if (!extensionWasDisabled && ( config.extensionDisabled || config[`${site}Disabled`] )) { // reset UI
            [styles.chatbar.node, styles.tweaks.node, styles.widescreen.node, styles.fullWin.node, buttons]
                .forEach(target => target?.remove())
            chatbar.reset()
            if (site != 'poe') document.body.removeEventListener('wheel', window.enableWheelScroll)
        } else if (!config.extensionDisabled && !config[`${site}Disabled`]) { // sync modes/tweaks/btns
            if (config.widescreen ^ styles.widescreen.node?.isConnected) { // sync Widescreen
                supressNotifs() ; toggleMode('widescreen') }
            if (sites[site].hasSidebar) {
                if (config.fullWindow ^ await ui.isFullWin()) { // sync Full-Window
                    supressNotifs() ; toggleMode('fullWindow') }
                sync.fullerWin() // sync Fuller Windows
            }
            styles.update({ key: 'tweaks' }) // sync HH/HF/TCB/NCB/BA
            styles.update({ key: 'chatbar' }) // sync WCB
            if (site != 'perplexity') chatbar.tweak() // update ChatGPT chatbar inner width or hack Poe btn pos
            buttons[config.btnsVisible ? 'insert' : 'remove']() // update button visibility
            if (options?.updatedKey == 'btnAnimationsDisabled' && !config.btnAnimationsDisabled) // apply/remove fx
                // ...to visually signal location + preview fx applied by Button Animations toggle-on
                buttons.animate()
            else if (/notifBottom|toastMode/.test(options?.updatedKey)) styles.update({ key: 'toast' })
            if (site != 'poe') // toggle free wheel locked in some Spam blocks
                document.body[`${ config.blockSpamDisabled ? 'remove' : 'add' }EventListener`](
                    'wheel', window.enableWheelScroll)
        }

        function supressNotifs() {
            if (config.notifiedDisabled) return
            settings.save('notifDisabled', true) // suppress notifs for cleaner UI
            setTimeout(() => settings.save('notifDisabled', false), 55) // ...temporarily
        }
    },

    fullerWin() { // requires components/buttons.js + lib/styles.js + config
        if (config.fullWindow && config.fullerWindows && !config.widescreen) { // activate fuller windows
            document.head.append(styles.widescreen.node) ; buttons.update.svg('widescreen', 'on')
        } else if (!config.fullWindow) { // de-activate fuller windows
            styles.fullWin.node?.remove() // to remove style too so sidebar shows
            if (!config.widescreen) { // disable widescreen if result of fuller window
                styles.widescreen.node.remove() ; buttons.update.svg('widescreen', 'off')
        }}
    },

    async mode(mode) { // setting + icon + chatbar
        const state = ( mode == 'widescreen' ? styles.widescreen.node?.isConnected
                      : mode == 'fullWindow' ? await ui.isFullWin()
                      : chatgpt.isFullScreen() )
        settings.save(mode, state) ; buttons.update.svg(mode)
        if (!config.extensionDisabled && !config[`${env.site}Disabled`]) { // tweak UI
            if (mode == 'fullWindow') sync.fullerWin()
            if (env.site == 'chatgpt') setTimeout(() => chatbar.tweak(), // update inner width
                mode == 'fullWindow' && ( config.widescreen || config.fullerWindows )
                    && config.widerChatbox ? 111 : 0) // delay if toggled to/from active WCB to avoid wrong width
            else if (env.site == 'perplexity' || env.site == 'poe' && config.widerChatbox)
                styles.update({ key: 'chatbar' }) // toggle full-width Perplexity chatbar or sync Poe WCB
            notify(`${browserAPI.getMsg('mode_' + mode)} ${
                      browserAPI.getMsg(`state_${ state ? 'on' : 'off' }`).toUpperCase()}`)
        }
        config.modeSynced = true ; setTimeout(() => config.modeSynced = false, 100) // prevent repetition
    }
};
