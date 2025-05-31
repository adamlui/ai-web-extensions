// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
//  © 2023–2025 KudoAI & contributors under the MIT license

(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || event.data.source != 'chatgpt-infinity.user.js') return
        postMessage({ source: 'chatgpt-infinity/*/extension/content.js' }, location.origin)
    })

    // Import JS resources
    for (const resource of [
        'components/modals.js', 'components/toggles.js', 'lib/browser.js', 'lib/chatgpt.min.js',
        'lib/dom.min.js', 'lib/infinity.js', 'lib/settings.js', 'lib/styles.js', 'lib/sync.js', 'lib/ui.js'
    ]) await import(chrome.runtime.getURL(resource))

    // Init ENV context
    window.env = { browser: { isMobile: chatgpt.browser.isMobile() }, ui: { scheme: ui.getScheme() }}
    env.browser.isPortrait = env.browser.isMobile && ( innerWidth < innerHeight )

    // Add CHROME MSG listener for background/popup requests to sync modes/settings
    chrome.runtime.onMessage.addListener(({ action, options, fromBG }) => {
        ({
            notify: () => notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => options[arg])),
            alert: () => modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => options[arg])),
            showAbout: () => chatgpt.isLoaded().then(() => modals.open('about')),
            syncConfigToUI: () => {
                fromBG && settings.save('infinityMode', false) // disable Infinity mode 1st to not transfer between tabs
                sync.configToUI(options)
            }
        }[action]?.() || console.warn(`Chome msg listener warning: "${action}"`))
    })

    // Import APP data
    ;({ app: window.app } = await chrome.storage.local.get('app'))

    // Init SETTINGS
    await settings.load('extensionDisabled', Object.keys(settings.controls)
        .filter(key => key != 'infinityMode')) // exclude infinityMode...
    settings.save('infinityMode', false) // ...to always init as false
    if (!config.replyLanguage) // init reply language if unset
        settings.save('replyLanguage', chrome.i18n.getUILanguage())
    if (!config.replyTopic) // init reply topic if unset
        settings.save('replyTopic', browserAPI.getMsg('menuLabel_all'))
    if (!config.replyInterval) settings.save('replyInterval', 7) // init refresh interval to 7 secs if unset

    // Define FUNCTIONS

    window.notify = function(msg, pos = '', notifDuration = '', shadow = '') {
        if (!styles.toast.node) styles.update({ key: 'toast' })
        if (config.notifDisabled
            && !new RegExp(`${browserAPI.getMsg('menuLabel_show')} ${browserAPI.getMsg('menuLabel_notifs')}`, 'i')
                .test(msg)
        ) return

        // Strip state word to append colored one later
        const foundState = [
            browserAPI.getMsg('state_on').toUpperCase(), browserAPI.getMsg('state_off').toUpperCase()
        ].find(word => msg.includes(word))
        if (foundState) msg = msg.replace(foundState, '')

        // Show notification
        chatgpt.notify(`${app.symbol} ${msg}`, pos ||( config.notifBottom ? 'bottom' : '' ),
            notifDuration, shadow || env.ui.scheme == 'light')
        const notif = document.querySelector('.chatgpt-notif:last-child')
        notif.classList.add(app.slug) // for styles.toast

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
                foundState == browserAPI.getMsg('state_off').toUpperCase() ? 'off' : 'on'][env.ui.scheme]
            styledStateSpan.append(foundState) ; notif.append(styledStateSpan)
        }
    }

    chatgpt.isIdle = function() { // replace waiting for chat to start in case of interrupts
        return new Promise(resolve => { // when stop btn missing
            new MutationObserver((_, obs) => {
                if (!chatgpt.getStopBtn()) { obs.disconnect(); resolve() }
            }).observe(document.body, { childList: true, subtree: true })
        })
    }

    // Run MAIN routine

    // Preload sidebar NAVICON variants
    toggles.sidebar.update.navicon({ preload: true })

    // Init BROWSER/UI props
    await Promise.race([chatgpt.isLoaded(), new Promise(resolve => setTimeout(resolve, 5000))]) // initial UI loaded

    // Add LISTENER to auto-disable Infinity Mode
    document.onvisibilitychange = () => {
        if (config.infinityMode) {
            settings.save('infinityMode', false) ; sync.configToUI({ updatedKey: 'infinityMode' }) }
    }

    // Add RISING PARTICLES styles
    ['gray', 'white'].forEach(color => document.head.append(
        dom.create.elem('link', { rel: 'stylesheet',
            href: `https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@71695ca/assets/styles/rising-particles/dist/${
                color}.min.css`
    })))

    toggles.sidebar.insert()

    // Auto-start if enabled
    if (config.autoStart) {
        settings.save('infinityMode', true) ; sync.configToUI({ updatedKey: 'infinityMode' })
        notify(`${browserAPI.getMsg('menuLabel_autoStart')}: ${browserAPI.getMsg('state_on').toUpperCase()}`)
    }

    // Monitor NODE CHANGES to maintain sidebar toggle visibility
    new MutationObserver(() => {
        if (!config.toggleHidden && document.querySelector(chatgpt.selectors.sidebar)
            && !document.querySelector(`.${toggles.sidebar.class}`)
            && toggles.sidebar.status != 'inserting'
        ) { toggles.sidebar.status = 'missing' ; toggles.sidebar.insert() }
    }).observe(document.body, { attributes: true, subtree: true })

    // Monitor SCHEME PREF changes to update sidebar toggle + modal colors
    new MutationObserver(handleSchemePrefChange).observe( // for site scheme pref changes
        document.documentElement, { attributes: true, attributeFilter: ['class'] })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener( // for browser/system scheme pref changes
        'change', () => requestAnimationFrame(handleSchemePrefChange))
    function handleSchemePrefChange() {
        const displayedScheme = ui.getScheme()
        if (env.ui.scheme != displayedScheme) {
            env.ui.scheme = displayedScheme ; toggles.sidebar.update.scheme() ; modals.stylize() }
    }

    // Disable distracting SIDEBAR CLICK-ZOOM effect
    if (!document.documentElement.hasAttribute('sidebar-click-zoom-observed')) {
        new MutationObserver(mutations => mutations.forEach(({ target }) => {
            if (target.closest('[class*=sidebar]') // include sidebar elems
                && !target.closest('[class*=sidebar-toggle]') // exclude our toggles.sidebar's elems
                && target.style.transform != 'none' // click-zoom occurred
            ) target.style.transform = 'none'
        })).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style'] })
        document.documentElement.setAttribute('sidebar-click-zoom-observed', true)
    }

})()
