// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
//  © 2023–2025 KudoAI & contributors under the MIT license

(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || event.data.source != 'chatgpt-auto-continue.user.js') return
        postMessage({ source: 'chatgpt-auto-continue/*/extension/content.js' }, location.origin)
    })

    // Add CHROME MSG listener for background/popup requests to sync modes/settings
    chrome.runtime.onMessage.addListener(req => {
        if (req.action == 'notify')
            notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => req.options[arg]))
        else if (req.action == 'alert')
            modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => req.options[arg]))
        else if (req.action == 'showAbout') chatgpt.isLoaded().then(() => modals.open('about'))
        else if (req.action == 'syncConfigToUI') syncConfigToUI(req.options)
    })

    // Import JS resources
    for (const resource of ['components/modals.js', 'lib/chatgpt.js', 'lib/dom.js', 'lib/settings.js', 'lib/ui.js'])
        await import(chrome.runtime.getURL(resource))

    // Init ENV context
    const env = { browser: { isMobile: chatgpt.browser.isMobile() }, ui: { scheme: ui.getScheme() }}
    env.browser.isPortrait = env.browser.isMobile && (innerWidth < innerHeight)

    // Import APP data
    const { app } = await chrome.storage.local.get('app')

    // Export DEPENDENCIES to imported resources
    dom.import({ scheme: env.ui.scheme }) // for dom.addRisingParticles()
    modals.import({ app, env }) // for app data + env['<browser|ui>'] flags

    // Init SETTINGS
    await settings.load('extensionDisabled', ...Object.keys(settings.controls))

    // Define FUNCTIONS

    function getMsg(key) { return chrome.i18n.getMessage(key) }

    function notify(msg, pos = '', notifDuration = '', shadow = '') {
        if (config.notifDisabled && !msg.includes(getMsg('menuLabel_modeNotifs'))) return

        // Strip state word to append colored one later
        const foundState = [
            getMsg('state_on').toUpperCase(), getMsg('state_off').toUpperCase() ].find(word => msg.includes(word))
        if (foundState) msg = msg.replace(foundState, '')

        // Show notification
        chatgpt.notify(`${app.symbol} ${msg}`, pos, notifDuration, shadow || env.ui.scheme == 'dark' ? '' : 'shadow')
        const notif = document.querySelector('.chatgpt-notif:last-child')

        // Append styled state word
        if (foundState) {
            const stateStyles = {
                on: {
                    light: 'color: #5cef48 ; text-shadow: rgba(255,250,169,0.38) 2px 1px 5px',
                    dark:  'color: #5cef48 ; text-shadow: rgb(55,255,0) 3px 0 10px'
                },
                off: {
                    light: 'color: #ef4848 ; text-shadow: rgba(255,169,225,0.44) 2px 1px 5px',
                    dark:  'color: #ef4848 ; text-shadow: rgba(255, 116, 116, 0.87) 3px 0 9px'
                }
            }
            const styledStateSpan = dom.create.elem('span')
            styledStateSpan.style.cssText = stateStyles[
                foundState == getMsg('state_off').toUpperCase() ? 'off' : 'on'][env.ui.scheme]
            styledStateSpan.append(foundState) ; notif.append(styledStateSpan)
        }
    }

    function checkBtnsToClick() {
        checkBtnsToClick.active = !config.extensionDisabled ; if (!checkBtnsToClick.active) return
        let continueBtnClicked = false // to increase delay before next check if true to avoid repeated clicks
        const btnTypesToCheck = ['Continue'] ; if (config.autoScroll) btnTypesToCheck.push('Scroll')
        const btns = {} ; btnTypesToCheck.forEach(type => btns[type] = chatgpt[`get${type}Btn`]())
        Object.entries(btns).forEach(([btnType, btn]) => {
            if (!btn || btnType == 'Scroll' && ( !config.autoScroll || !chatgpt.isTyping() )) return
            btn.click()
            if (btnType == 'Continue') {
                continueBtnClicked = true
                notify(getMsg('notif_chatAutoContinued'), 'bottom-right')
                if (config.autoScroll) try { chatgpt.scrollToBottom() } catch(err) {}
        }})
        setTimeout(checkBtnsToClick, continueBtnClicked ? 5000 : 500)
    }

    async function syncConfigToUI() { // on toolbar popup toggles + ChatGPT tab activations
        await settings.load('extensionDisabled', ...Object.keys(settings.controls))
        if (!config.extensionDisabled && !checkBtnsToClick.active) checkBtnsToClick()
    }

    // Run MAIN routine

    // Add RISING PARTICLES styles
    ['gray', 'white'].forEach(color => document.head.append(
        dom.create.elem('link', { rel: 'stylesheet',
            href: `https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@727feff/styles/rising-particles/dist/${
                color}.min.css`
    })))

    // Observe DOM for need to continue generating response
    if (!config.extensionDisabled) {
        checkBtnsToClick()

    // NOTIFY of status on load
        notify(`${getMsg('mode_autoContinue')}: ${ getMsg('state_on').toUpperCase()}`)
    }

    // Monitor SCHEME PREF changes to update sidebar toggle + modal colors
    new MutationObserver(handleSchemePrefChange).observe( // for site scheme pref changes
        document.documentElement, { attributes: true, attributeFilter: ['class'] })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener( // for browser/system scheme pref changes
        'change', () => requestAnimationFrame(handleSchemePrefChange))
    function handleSchemePrefChange() {
        const displayedScheme = ui.getScheme()
        if (env.ui.scheme != displayedScheme) { env.ui.scheme = displayedScheme ;  modals.stylize() }
    }

})()
