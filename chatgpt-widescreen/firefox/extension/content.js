// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
//  © 2023–2025 KudoAI & contributors under the MIT license

(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || event.data.source != 'chatgpt-widescreen-mode.user.js') return
        postMessage({ source: 'chatgpt-widescreen/*/extension/content.js' }, location.origin)
    })

    // Import JS resources
    for (const resource of [
        'lib/browser.js', 'lib/chatbar.js', 'lib/chatgpt.min.js', 'lib/dom.js', 'lib/settings.js', 'lib/styles.js',
        'lib/sync.js', 'lib/ui.js', 'components/buttons.js', 'components/icons.js', 'components/modals.js',
        'components/tooltip.js'
    ]) await import(chrome.runtime.getURL(resource))

    // Init ENV context
    window.env = {
        browser: { isFF: navigator.userAgent.includes('Firefox'), isMobile: chatgpt.browser.isMobile() },
        site: location.hostname.split('.').slice(-2, -1)[0], ui: {}
    }
    env.browser.isPortrait = env.browser.isMobile && ( innerWidth < innerHeight )
    ui.getScheme().then(scheme => env.ui.scheme = scheme)
    if (env.site == 'chatgpt') // store native chatbar width for Wider Chatbox style
        chatbar.nativeWidth = dom.get.computedWidth(document.querySelector('main form'))

    // Add CHROME MSG listener for background/popup requests to sync modes/settings
    chrome.runtime.onMessage.addListener(({ action, options }) => {
        ({
            notify: () => notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => options[arg])),
            alert: () => modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => options[arg])),
            showAbout: async () => { if (env.site == 'chatgpt') await chatgpt.isLoaded() ; modals.open('about') },
            syncConfigToUI: () => sync.configToUI(options)
        }[action]?.() || console.warn(`Received unsupported action: "${action}"`))
    })

    // Import DATA
    ;({ app: window.app } = await chrome.storage.local.get('app'))
    ;({ sites: window.sites } = await chrome.storage.local.get('sites'))

    // Init SETTINGS
    const firstRunKey = `${env.site}_isFirstRun`
    if ((await chrome.storage.local.get(firstRunKey))[firstRunKey] == undefined) { // activate widescreen on install
        settings.save('widescreen', true) ; settings.save('isFirstRun', false) }
    settings.siteDisabledKeys = Object.keys(sites).map(site => `${site}Disabled`)
    await settings.load('extensionDisabled', ...settings.siteDisabledKeys, ...sites[env.site].availFeatures)

    // Define FUNCTIONS

    window.notify = function(msg, pos = '', notifDuration = '', shadow = '') {
        if (!styles.toast.node) styles.toast.update()
        if (config.notifDisabled &&
            !new RegExp(`${browserAPI.getMsg('menuLabel_notifs')}|${browserAPI.getMsg('mode_toast')}`).test(msg))
                return

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

    window.toggleMode = async (mode, state = '') => {
        switch (state.toUpperCase()) {
            case 'ON' : activateMode(mode) ; break
            case 'OFF' : deactivateMode(mode) ; break
            default : (
                mode == 'widescreen' ? styles.widescreen.node.isConnected
              : mode == 'fullWindow' ? await ui.isFullWin() : chatgpt.isFullScreen()
            ) ? deactivateMode(mode) : activateMode(mode)
        }

        async function activateMode(mode) {
            if (mode == 'widescreen') { document.head.append(styles.widescreen.node) ; sync.mode('widescreen') }
            else if (mode == 'fullWindow') {
                const { site } = env, { selectors } = sites[site],
                      sidebarToggle = document.querySelector(selectors.btns.sidebar)
                if (site == 'chatgpt') {
                    const sidebars = {
                        left: document.querySelector(selectors.sidebar),
                        right: document.querySelector(selectors.rightbar)
                    }
                    const sidebarsToHide = []
                    Object.entries(sidebars).forEach(([side, bar]) => // push fat/visible ones to hide
                        bar && dom.get.computedWidth(bar) > 100 && sidebarsToHide.push({ side, bar }))
                    sidebarsToHide.forEach(({ side, bar }) => { // hide'em
                        if (side == 'left') sidebarToggle.click() ; else bar.style.display = 'none' })
                } else if (site == 'perplexity') sidebarToggle.click()
                else /* poe */ document.head.append(styles.fullWin.node)
                if (site != 'chatgpt') sync.mode('fullWindow') // since they don't monitor sidebar
            } else if (mode == 'fullscreen') document.documentElement.requestFullscreen()
        }

        function deactivateMode(mode) {
            if (mode == 'widescreen') { styles.widescreen.node.remove() ; sync.mode('widescreen') }
            else if (mode == 'fullWindow') {
                const { site } = env, { selectors } = sites[site],
                      sidebarToggle = document.querySelector(selectors.btns.sidebar)
                if (sidebarToggle) {
                    sidebarToggle.click()
                    if (site == 'chatgpt') {
                        const rightbar = document.querySelector(selectors.rightbar)
                        if (rightbar) rightbar.style.display = ''
                    }
                } else styles.fullWin.node.remove()
                if (site != 'chatgpt') sync.mode('fullWindow') // since they don't monitor sidebar
            } else if (mode == 'fullscreen') {
                if (config.f11) modals.alert(browserAPI.getMsg('alert_pressF11'), `${browserAPI.getMsg('alert_f11reason')}.`)
                else document.exitFullscreen()
                    .catch(err => console.error(app.symbol + ' » Failed to exit fullscreen', err))
            }
        }
    }

    env.ui.hasTallChatbar = await chatbar.is.tall()

    chatgpt.canvasIsOpen = function() {
        return document.querySelector('section.popover')?.getBoundingClientRect().top == 0 }

    // Run MAIN routine

    // Init UI props
    if (env.site == 'chatgpt') {
        sites.chatgpt.hasSidebar = !!await Promise.race([
            dom.get.loadedElem(sites.chatgpt.selectors.btns.sidebar), // DOM element if sidebar toggle loads
            dom.get.loadedElem(sites.chatgpt.selectors.btns.login).then(() => false), // null if login button loads
            new Promise(resolve => setTimeout(() => resolve(null), 3000)) // null if 3s passed
        ])
    }

    // Init FULL-MODE states
    config.fullscreen = chatgpt.isFullScreen()
    if (sites[env.site].selectors.btns.sidebar) // site has native FW state
         config.fullWindow = await ui.isFullWin() // ...so match it
    else await settings.load('fullWindow') // otherwise load CWM's saved state

    // Create/append STYLES
    ;['chatbar', 'fullWin', 'tweaks', 'widescreen'].forEach(style => styles[style].update())
    ;['gray', 'white'].forEach(color => document.head.append( // Rising Particles styles
        dom.create.elem('link', { rel: 'stylesheet',
            href: `https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@71695ca/assets/styles/rising-particles/dist/${
                color}.min.css`
    })))

    // Restore PREV SESSION's state
    if (!config.extensionDisabled && !config[`${env.site}Disabled`]) {
        if (config.btnsVisible) buttons.insert()
        if (config.widescreen) toggleMode('widescreen', 'ON')
        if (config.fullWindow && sites[env.site].hasSidebar) {
            if (sites[env.site].selectors.btns.sidebar) // site has own FW config
                sync.mode('fullWindow') // ...so sync w/ it
            else toggleMode('fullWindow', 'on') // otherwise self-toggle
        }
        if (env.site != 'poe') { // toggle free wheel locked in some Spam blocks
            window.enableWheelScroll = event => event.stopPropagation()
            document.body[`${ config.blockSpamDisabled ? 'remove' : 'add' }EventListener`](
                'wheel', window.enableWheelScroll)
        }
    }

    // Monitor NODE CHANGES to maintain button visibility + update colors
    let isTempChat = false, canvasWasOpen = chatgpt.canvasIsOpen()
    new MutationObserver(async () => {

        // Maintain button visibility on nav
        if (config.extensionDisabled || config[`${env.site}Disabled`] || !config.btnsVisible) return
        else if (!buttons.fullscreen?.isConnected && !chatgpt.canvasIsOpen()
            && await chatbar.get() && buttons.state.status != 'inserting'
        ) { buttons.state.status = 'missing' ; buttons.insert() }

        // Maintain button colors + Widescreen button visibility on snowflake chatgpt.com
        if (env.site == 'chatgpt') {

            // Update button colors on temp chat toggle
            const chatbarIsDark = await chatbar.is.dark()
            if (chatbarIsDark != isTempChat) { buttons.update.color() ; isTempChat = chatbarIsDark }

            // Remove buttons on Canvas mode toggle-on
            if (canvasWasOpen ^ chatgpt.canvasIsOpen()) { buttons.remove() ; canvasWasOpen = !canvasWasOpen }
        }
    }).observe(document[env.site == 'poe' ? 'head' : 'body'], { attributes: true, subtree: true })

    // Monitor SCHEME PREF changes to update sidebar toggle + modal colors
    new MutationObserver(handleSchemePrefChange).observe( // for site scheme pref changes
        document.documentElement, { attributes: true, attributeFilter: ['class', 'data-color-scheme'] })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener( // for browser/system scheme pref changes
        'change', () => requestAnimationFrame(handleSchemePrefChange))
    async function handleSchemePrefChange() {
        const displayedScheme = await ui.getScheme()
        if (env.ui.scheme != displayedScheme) {
            env.ui.scheme = displayedScheme ; modals.stylize() ; buttons.update.color() }
    }

    // Monitor SIDEBARS to update config.fullWindow for sites w/ native toggle
    if (sites[env.site].selectors.btns.sidebar && sites[env.site].hasSidebar) {
        const sidebarObserver = new ResizeObserver( // sync config.fullWindow ⇆ sidebar width
            async () => (config.fullWindow ^ await ui.isFullWin()) && !config.modeSynced && sync.mode('fullWindow'))
        observeSidebars()
        new MutationObserver( // re-observeSidebars() on disconnect
            () => getSidebars().some(bar => !sidebarObserver.targets?.includes(bar)) && observeSidebars()
        ).observe(document.body, { childList: true, subtree: true })

        function getSidebars() {
            const site = env.site, selectors = sites[site].selectors,
                  sidebars = [document.querySelector(selectors.sidebar)]
            if (site == 'chatgpt') sidebars.push(document.querySelector(selectors.rightbar))
            return sidebars.filter(Boolean)
        }

        function observeSidebars() {
            const sidebars = getSidebars() ; if (!sidebars.length) return
            sidebarObserver.targets?.forEach(target => sidebarObserver.unobserve(target))
            sidebars.forEach(sidebar => sidebarObserver.observe(sidebar))
            sidebarObserver.targets = sidebars
        }
    }

    // Add RESIZE LISTENER to update full screen setting/button + disable F11 flag
    addEventListener('resize', () => {
        const fullscreenState = chatgpt.isFullScreen()
        if (config.fullscreen && !fullscreenState) { // exiting full screen
            sync.mode('fullscreen') ; config.f11 = false }
        else if (!config.fullscreen && fullscreenState) // entering full screen
            sync.mode('fullscreen')
        if (env.site == 'chatgpt') chatbar.tweak() // update chatgpt.com chatbar inner width
    })

    // Add KEY LISTENER to enable flag on F11 + stop generating text on ESC
    document.addEventListener('keydown', event => {
        if ((event.key == 'F11' || event.keyCode == 122) && !config.fullscreen) config.f11 = true
        else if ((event.key.startsWith('Esc') || event.keyCode == 27) && chatgpt.isTyping())
            try { chatgpt.stop() ; requestAnimationFrame(() => !chatgpt.isTyping() &&
                    notify(browserAPI.getMsg('notif_chatStopped'), 'bottom-right')) } catch (err) {}
    })

})()
