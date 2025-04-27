// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
//  © 2023–2025 KudoAI & contributors under the MIT license

(async () => {

    // Add WINDOW MSG listener for userscript request to self-disable
    addEventListener('message', event => {
        if (event.origin != location.origin || event.data.source != 'chatgpt-widescreen-mode.user.js') return
        postMessage({ source: 'chatgpt-widescreen/*/extension/content.js' }, location.origin)
    })

    chrome.runtime.onMessage.addListener(({ action, options }) => {
        ({
            notify: () => notify(...['msg', 'pos', 'notifDuration', 'shadow'].map(arg => options[arg])),
            alert: () => modals.alert(...['title', 'msg', 'btns', 'checkbox', 'width'].map(arg => options[arg])),
            showAbout: async () => { if (env.site == 'chatgpt') await chatgpt.isLoaded() ; modals.open('about') },
            syncConfigToUI: () => sync.configToUI(options)
        }[action]?.())
    })

    // Import JS resources
    for (const resource of [
        'lib/chatbar.js', 'lib/chatgpt.js', 'lib/dom.js', 'lib/settings.js', 'lib/ui.js',
        'components/buttons.js', 'components/icons.js', 'components/modals.js', 'components/tooltip.js'
    ]) await import(chrome.runtime.getURL(resource))

    // Init ENV context
    const env = {
        browser: { isFF: navigator.userAgent.includes('Firefox'), isMobile: chatgpt.browser.isMobile() },
        site: location.hostname.split('.').slice(-2, -1)[0], ui: {}
    }

    env.browser.isPortrait = env.browser.isMobile && (innerWidth < innerHeight)
    ui.import({ site: env.site }) ; ui.getScheme().then(scheme => env.ui.scheme = scheme)
    if (env.site == 'chatgpt') // store native chatbar width for Wider Chatbox style
        chatbar.nativeWidth = dom.get.computedWidth(document.querySelector('main form'))

    // Import DATA
    const { app } = await chrome.storage.local.get('app'),
          { sites } = await chrome.storage.local.get('sites')

    // Export DEPENDENCIES to imported resources
    chatbar.import({ site: env.site, sites }) // for conditional logic + sites.selectors
    dom.import({ scheme: env.ui.scheme }) // for dom.addRisingParticles()
    modals.import({ app, env }) // for app data + env['<browser|ui>'] flags
    settings.import({ site: env.site, sites }) // to load/save active tab's settings + `${site}Disabled`
    tooltip.import({ app, env, sites }) // for tooltip class + .update() position logic
    ui.import({ sites }) // for ui.isFullWin() sidebar selector/flag

    // Init SETTINGS
    const firstRunKey = `${env.site}_isFirstRun`
    if ((await chrome.storage.local.get(firstRunKey))[firstRunKey] == undefined) { // activate widescreen on install
        settings.save('widescreen', true) ; settings.save('isFirstRun', false) }
    settings.siteDisabledKeys = Object.keys(sites).map(site => `${site}Disabled`)
    await settings.load('extensionDisabled', ...settings.siteDisabledKeys, ...sites[env.site].availFeatures)

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

    function toggleMode(mode, state = '') {
        switch (state.toUpperCase()) {
            case 'ON' : activateMode(mode) ; break
            case 'OFF' : deactivateMode(mode) ; break
            default : ( mode == 'widescreen' ? document.head.contains(widescreenStyle)
                      : mode == 'fullWindow' ? ui.isFullWin() : chatgpt.isFullScreen() ) ? deactivateMode(mode)
                                                                                         : activateMode(mode)
        }

        function activateMode(mode) {
            if (mode == 'widescreen') { document.head.append(widescreenStyle) ; sync.mode('widescreen') }
            else if (mode == 'fullWindow') {
                const selectors = sites[env.site].selectors,
                      sidebarToggle = document.querySelector(selectors.btns.sidebar)
                if (sidebarToggle) {
                    const sidebars = { left: document.querySelector(selectors.sidebar) }, sidebarsToHide = []
                    if (env.site == 'chatgpt') sidebars.right = document.querySelector(selectors.rightbar)
                    Object.entries(sidebars).forEach(([side, bar]) => // push fat/visible ones to hide
                        bar && dom.get.computedWidth(bar) > 100 && sidebarsToHide.push({ side, bar }))
                    sidebarsToHide.forEach(({ side, bar }) => { // hide'em
                        if (side == 'left') sidebarToggle.click() ; else bar.style.display = 'none' })
                } else { document.head.append(fullWinStyle) ; sync.mode('fullWindow') }
            } else if (mode == 'fullscreen') document.documentElement.requestFullscreen()
        }

        function deactivateMode(mode) {
            if (mode == 'widescreen') { widescreenStyle.remove() ; sync.mode('widescreen') }
            else if (mode == 'fullWindow') {
                const selectors = sites[env.site].selectors,
                      sidebarToggle = document.querySelector(selectors.btns.sidebar)
                if (sidebarToggle) {
                    sidebarToggle.click()
                    if (env.site == 'chatgpt') {
                        const rightbar = document.querySelector(selectors.rightbar)
                        if (rightbar) rightbar.style.display = ''
                    }
                } else { fullWinStyle.remove() ; sync.mode('fullWindow') }
            } else if (mode == 'fullscreen') {
                if (config.f11) modals.alert(getMsg('alert_pressF11'), `${getMsg('alert_f11reason')}.`)
                else document.exitFullscreen()
                    .catch(err => console.error(app.symbol + ' » Failed to exit fullscreen', err))
            }
        }
    }

    const tweaksStyle = dom.create.style() ; env.ui.hasTallChatbar = await chatbar.is.tall()
    buttons.import({ app, env, sites, toggleMode, tweaksStyle })

    const update = {

        style: {

            chatbar() {
                chatbarStyle.innerText = (
                    env.site == 'chatgpt' ? ( config.widerChatbox ? ''
                          : `main form { max-width: ${chatbar.nativeWidth}px !important ; margin: auto }`
                    ) : env.site == 'poe' ? ( config.widerChatbox && config.widescreen ?
                          '[class^=ChatPageMainFooter_footerInner] { width: 98% ; margin-right: 15px }' : ''
                    ) : ''
                )
            },

            tweaks() {
                const selectors = sites[env.site].selectors
                tweaksStyle.innerText = (
                    ( env.site == 'chatgpt' ?
                           `[id$=-btn]:hover { opacity: 100% !important } /* prevent chatbar btn dim on hover */
                            main { overflow: clip !important }` // prevent h-scrollbar...
                                // ...on sync.mode('fullWindow) => delayed chatbar.tweak()
                    : env.site == 'perplexity' ? '[id$=-btn]:hover { background: none !important }' // prevent overlay
                    : '' )
                  + ( config.tcbDisabled == false ? tcbStyle : '' ) // expand text input vertically
                  + ( config.hiddenHeader ? hhStyle : '' ) // hide header
                  + ( config.hiddenFooter ? hfStyle : '' ) // hide footer
                  + `#newChat-btn { display: ${ config.ncbDisabled == true ? 'none' : 'flex' }}`
                  + ( config.btnAnimationsDisabled ? '' : // zoom chatbar buttons on hover
                        `.${buttons.class} { will-change: transform } /* prevent wobble */
                         .${buttons.class}:hover { transform: scale(${ env.site == 'poe' ? 1.15 : 1.285 }) }` )
                  + ( config.blockSpamDisabled ? ''
                        : `${getAllSelectors(selectors.spam).join(',')} { display: none !important }
                          body { pointer-events: unset !important }` /* free click lock from blocking modals */ )
                )
                function getAllSelectors(obj) {
                    return Object.values(obj).flatMap(val => typeof val == 'object' ? getAllSelectors(val) : val) }
            },

            widescreen() {
                widescreenStyle.innerText = (
                    env.site == 'chatgpt' ?
                       `.text-base { max-width: 100% !important } /* widen outer container */
                        .tableContainer { min-width: 100% }` // widen tables
                    : env.site == 'perplexity' ?
                       `.max-w-threadWidth, .max-w-threadContentWidth { /* widen limiting Page/Answer containers */
                            max-width: 100% }
                        @media (min-width: 769px) { .col-span-8 { width: 151% }} /* widen inner-left container */
                        .col-span-4:has([class*=sticky]) { display: none }` // hide right-bar
                    : env.site == 'poe' ?
                       `[class*=ChatMessagesView] { width: 100% !important } /* widen outer container */
                        [class^=Message] { max-width: 100% !important }` // widen speech bubbles
                  : '' )
            }
        }
    }

    const sync = {

        async configToUI(options) { // on toolbar popup toggles + AI tab activations
            const extensionWasDisabled = config.extensionDisabled || config[`${env.site}Disabled`]
            await settings.load('extensionDisabled', ...settings.siteDisabledKeys, ...sites[env.site].availFeatures)
            if (!extensionWasDisabled && ( config.extensionDisabled || config[`${env.site}Disabled`] )) { // reset UI
                [widescreenStyle, fullWinStyle, buttons].forEach(target => target.remove())
                tweaksStyle.innerText = '' ; chatbar.reset()
                if (/chatgpt|perplexity/.test(env.site))
                    document.body.removeEventListener('wheel', window.enableWheelScroll)
            } else if (!config.extensionDisabled && !config[`${env.site}Disabled`]) { // sync modes/tweaks/btns
                if (config.widescreen ^ document.head.contains(widescreenStyle)) { // sync Widescreen
                    supressNotifs() ; toggleMode('widescreen') }
                if (sites[env.site].hasSidebar) {
                    if (config.fullWindow ^ ui.isFullWin()) { // sync Full-Window
                        supressNotifs() ; toggleMode('fullWindow') }
                    sync.fullerWin() // sync Fuller Windows
                }
                update.style.tweaks() // sync TCB/NCB/HH/HF/BA
                update.style.chatbar() // sync WCB
                chatbar.tweak() // update ChatGPT chatbar inner width or hack other sites' button positions
                buttons[config.btnsVisible ? 'insert' : 'remove']() // update button visibility
                if (options?.updatedKey == 'btnAnimationsDisabled' && !config.btnAnimationsDisabled) // apply/remove fx
                    // ...to visually signal location + preview fx applied by Button Animations toggle-on
                    buttons.animate()
                if (/chatgpt|perplexity/.test(env.site)) // toggle free wheel locked in some Spam blocks
                    document.body[`${ config.blockSpamDisabled ? 'remove' : 'add' }EventListener`](
                        'wheel', window.enableWheelScroll)
            }

            function supressNotifs() {
                if (config.notifiedDisabled) return
                settings.save('notifDisabled', true) // suppress notifs for cleaner UI
                setTimeout(() => settings.save('notifDisabled', false), 55) // ...temporarily
            }
        },

        fullerWin() {
            if (config.fullWindow && config.fullerWindows && !config.widescreen) { // activate fuller windows
                document.head.append(widescreenStyle) ; buttons.update.svg('widescreen', 'on')
            } else if (!config.fullWindow) { // de-activate fuller windows
                fullWinStyle.remove() // to remove style too so sidebar shows
                if (!config.widescreen) { // disable widescreen if result of fuller window
                    widescreenStyle.remove() ; buttons.update.svg('widescreen', 'off')
            }}
        },

        async mode(mode) { // setting + icon + chatbar
            const state = ( mode == 'widescreen' ? !!document.getElementById('widescreen-mode')
                          : mode == 'fullWindow' ? ui.isFullWin()
                                                 : chatgpt.isFullScreen() )
            settings.save(mode, state) ; buttons.update.svg(mode)
            if (!config.extensionDisabled && !config[`${env.site}Disabled`]) { // tweak UI
                if (mode == 'fullWindow') sync.fullerWin()
                if (env.site == 'chatgpt') setTimeout(() => chatbar.tweak(), // update inner width
                    mode == 'fullWindow' && ( config.widescreen || config.fullerWindows )
                        && config.widerChatbox ? 111 : 0) // delay if toggled to/from active WCB to avoid wrong width
                else if (env.site == 'perplexity' || env.site == 'poe' && config.widerChatbox)
                    update.style.chatbar() // toggle full-width Perplexity chatbar or sync Poe WCB
                notify(`${getMsg('mode_' + mode)} ${getMsg(`state_${ state ? 'on' : 'off' }`).toUpperCase()}`)
            }
            config.modeSynced = true ; setTimeout(() => config.modeSynced = false, 100) // prevent repetition
        }
    }

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
         config.fullWindow = ui.isFullWin() // ...so match it
    else await settings.load('fullWindow') // otherwise load CWM's saved state

    // Apply general style TWEAKS
    const tcbStyle = ( // heighten chatbox
        env.site == 'chatgpt' ? `div[class*=prose]:has(${sites.chatgpt.selectors.input})`
                              : sites[env.site].selectors.input )
                  + '{ max-height: 68vh }'
    const hhStyle = sites[env.site].selectors.header + '{ display: none !important }' // hide header
                  + ( env.site == 'chatgpt' ? 'main { padding-top: 12px }' : '' ) // increase top-padding
    const hfStyle = `${sites[env.site].selectors.footer}${ // hide footer
        /chatgpt|perplexity/.test(env.site) ? `, ${sites[env.site].selectors.btns.help}` : '' } { display: none }`

    update.style.tweaks() ; document.head.append(tweaksStyle);

    // Add RISING PARTICLES styles
    ['gray', 'white'].forEach(color => document.head.append(
        dom.create.elem('link', { rel: 'stylesheet',
            href: `https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@727feff/assets/styles/rising-particles/dist/${
                color}.min.css`
    })))

    // Create WIDESCREEN style
    const widescreenStyle = dom.create.style(null, { id: 'widescreen-mode' })
    update.style.widescreen()

    // Create FULL-WINDOW style
    const fullWinStyle = dom.create.style(
        sites[env.site].selectors.sidebar + '{ display: none }', { id: 'fullWindow-mode' })

    // Create/append CHATBAR style
    const chatbarStyle = dom.create.style()
    update.style.chatbar() ; document.head.append(chatbarStyle)

    // Restore PREV SESSION's state
    if (!config.extensionDisabled && !config[`${env.site}Disabled`]) {
        if (config.btnsVisible) buttons.insert()
        if (config.widescreen) toggleMode('widescreen', 'ON')
        if (config.fullWindow && sites[env.site].hasSidebar) {
            if (sites[env.site].selectors.btns.sidebar) // site has own FW config
                sync.mode('fullWindow') // ...so sync w/ it
            else toggleMode('fullWindow', 'on') // otherwise self-toggle
        }
        if (/chatgpt|perplexity/.test(env.site)) { // toggle free wheel locked in some Spam blocks
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
            () => (config.fullWindow ^ ui.isFullWin()) && !config.modeSynced && sync.mode('fullWindow'))
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

    // Monitor PERPLEXITY NAV to update Attach File button alignment on delayed re-appearances
    if (env.site == 'perplexity') {
        let prevPath = location.pathname
        new MutationObserver(async () => { if (location.pathname != prevPath) {
            prevPath = location.pathname
            const attachFileBtn = await dom.get.loadedElem(sites.perplexity.selectors.btns.attachFile),
                  cwmActive = buttons.fullscreen?.isConnected
            if (attachFileBtn['data-left-aligned'] ^ cwmActive) chatbar[cwmActive ? 'tweak' : 'reset']()
        }}).observe(document.body, { childList: true, subtree: true })
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
                    notify(getMsg('notif_chatStopped'), 'bottom-right')) } catch (err) {}
    })

})()
