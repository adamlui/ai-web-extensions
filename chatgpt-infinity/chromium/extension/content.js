(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || !event.data?.source?.endsWith('chatgpt-infinity.user.js')) return
        postMessage({ source: 'chatgpt-infinity/*/extension/content.js' }, location.origin)
    })

    // Import JS resources
    for (const resource of [
        'components/modals.js', 'components/toggles.js', 'lib/i18n.js', 'lib/chatgpt.min.js', 'lib/dom.min.js',
        'lib/feedback.js', 'lib/infinity.js', 'lib/settings.js', 'lib/styles.js', 'lib/sync.js', 'lib/ui.js'
    ]) await import(chrome.runtime.getURL(resource))

    // Init ENV context
    window.env = { browser: { isMobile: chatgpt.browser.isMobile() }, ui: { scheme: ui.getScheme() }}
    Object.assign(env.browser, { get isCompact() { return innerWidth <= 480 }})

    // Add CHROME MSG listener for background/popup requests to sync modes/settings
    chrome.runtime.onMessage.addListener(({ action, options, source }) => {
        ({
            notify: () => feedback.notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => options[arg])),
            alert: () => modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => options[arg])),
            showAbout: () =>
                source?.endsWith('service-worker.js') && chatgpt.isLoaded().then(() => modals.open('about')),
            showFeedback: () => chatgpt.isLoaded().then(() => modals.open('feedback')),
            syncConfigToUI: () => {
                if (source?.endsWith('service-worker.js')) // disable Infinity mode 1st to not transfer between tabs
                    settings.save('infinityMode', false)
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
    if (!app.config.replyLanguage) // init reply language if unset
        settings.save('replyLanguage', chrome.i18n.getUILanguage())
    if (!app.config.replyTopic) // init reply topic if unset
        settings.save('replyTopic', i18n.getMsg('menuLabel_all'))
    if (!app.config.replyInterval) settings.save('replyInterval', 7) // init refresh interval to 7 secs if unset

    // Define FUNCTIONS

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
        if (app.config.infinityMode) {
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
    if (app.config.autoStart) {
        settings.save('infinityMode', true) ; sync.configToUI({ updatedKey: 'infinityMode' })
        feedback.notify(`${i18n.getMsg('menuLabel_autoStart')}: ${i18n.getMsg('state_on').toUpperCase()}`)
    }

    // Monitor NODE CHANGES to maintain sidebar toggle visibility
    new MutationObserver(() => {
        if (!app.config.toggleHidden && document.querySelector(chatgpt.selectors.sidebar)
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

})()
