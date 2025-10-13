(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || !event.data?.source?.endsWith('chatgpt-auto-continue.user.js')) return
        postMessage({ source: 'chatgpt-auto-continue/*/extension/content.js' }, location.origin)
    })

    // Add CHROME MSG listener for background/popup requests to sync modes/settings
    chrome.runtime.onMessage.addListener(({ action, options, source }) => {
        ({
            notify: () => feedback.notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => options[arg])),
            alert: () => modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => options[arg])),
            showAbout: () =>
                source?.endsWith('service-worker.js') && chatgpt.isLoaded().then(() => modals.open('about')),
            showFeedback: () => chatgpt.isLoaded().then(() => modals.open('feedback')),
            syncConfigToUI: () => sync.configToUI(options)
        }[action]?.() || console.warn(`Chome msg listener warning: "${action}"`))
    })

    // Import JS resources
    for (const resource of [
        'components/modals.js', 'lib/browser.js', 'lib/chatgpt.min.js', 'lib/dom.min.js',
        'lib/feedback.js', 'lib/settings.js', 'lib/styles.js', 'lib/sync.js', 'lib/ui.js'
    ]) await import(chrome.runtime.getURL(resource))

    // Init ENV context
    window.env = { browser: { isMobile: chatgpt.browser.isMobile() }, ui: { scheme: ui.getScheme() }}
    env.browser.isPortrait = env.browser.isMobile && ( innerWidth < innerHeight )

    // Import APP data
    ;({ app: window.app } = await chrome.storage.local.get('app'))

    // Init SETTINGS
    await settings.load('extensionDisabled', Object.keys(settings.controls))

    // Define FUNCTIONS

    window.checkBtnsToClick = () => {
        checkBtnsToClick.active = !config.extensionDisabled ; if (!checkBtnsToClick.active) return
        let continueBtnClicked = false // to increase delay before next check if true to avoid repeated clicks
        const btnTypesToCheck = ['Continue'] ; if (config.autoScroll) btnTypesToCheck.push('Scroll')
        const btns = {} ; btnTypesToCheck.forEach(type => btns[type] = chatgpt[`get${type}Btn`]())
        Object.entries(btns).forEach(([btnType, btn]) => {
            if (!btn || btnType == 'Scroll' && ( !config.autoScroll || !chatgpt.isTyping() )) return
            btn.click()
            if (btnType == 'Continue') {
                continueBtnClicked = true
                feedback.notify(browserAPI.getMsg('notif_chatAutoContinued'), 'bottom-right')
                if (config.autoScroll) try { chatgpt.scrollToBottom() } catch(err) {}
        }})
        setTimeout(checkBtnsToClick, continueBtnClicked ? 5000 : 500)
    }

    // Run MAIN routine

    // Add RISING PARTICLES styles
    ['gray', 'white'].forEach(color => document.head.append(
        dom.create.elem('link', { rel: 'stylesheet',
            href: `https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@71695ca/assets/styles/rising-particles/dist/${
                color}.min.css`
    })))

    // Observe DOM for need to continue generating response
    if (!config.extensionDisabled) {
        checkBtnsToClick()

    // NOTIFY of status on load
        feedback.notify(`${browserAPI.getMsg('mode_autoContinue')}: ${ browserAPI.getMsg('state_on').toUpperCase()}`)
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
