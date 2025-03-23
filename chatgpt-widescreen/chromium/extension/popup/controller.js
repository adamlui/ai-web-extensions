(async () => {

    // Import JS resources
    for (const resource of ['components/icons.js', 'lib/dom.js', 'lib/settings.js'])
        await import(chrome.runtime.getURL(resource))

    // Init ENV context
    const env = {
        site: new URL((await chrome.tabs.query({ active: true, currentWindow: true }))[0].url)
            .hostname.split('.').slice(-2, -1)[0], // extract 2nd-level domain
        browser: {
            displaysEnglish: chrome.i18n.getUILanguage().startsWith('en'),
            isFF: navigator.userAgent.includes('Firefox')
        }
    }

    // Import DATA
    const { app } = await chrome.storage.local.get('app'),
          { sites } = await chrome.storage.local.get('sites')
    app.name = env.browser.displaysEnglish ? app.name : getMsg('appName') // for shorter notifs

    // Export DEPENDENCIES to imported resources
    icons.import({ app }) // for src's using app.urls.assetHost
    settings.import({ site: env.site, sites }) // to load/save active tab's settings + `${site}Disabled`

    // Define FUNCTIONS

    function extensionIsDisabled() { return config.extensionDisabled || !!config[`${env.site}Disabled`] }
    function getMsg(key) { return chrome.i18n.getMessage(key) }

    function notify(msg, pos = 'bottom-right') {
        if (config.notifDisabled && !msg.includes(getMsg('menuLabel_modeNotifs'))) return
        sendMsgToActiveTab('notify', { msg, pos })
    }

    async function sendMsgToActiveTab(action, options) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        return await chrome.tabs.sendMessage(activeTab.id, { action: action, options: { ...options }})
    }

    const sync = {
        fade() {

            // Toolbar icon
            chrome.action.setIcon({ path: Object.fromEntries(
                Object.keys(chrome.runtime.getManifest().icons).map(dimension =>
                    [dimension, `../icons/${ config.extensionDisabled ? 'faded/' : '' }icon${dimension}.png`]
            ))})

            // Menu elems
            document.querySelectorAll('.logo, .menu-title, .menu-entry').forEach((elem, idx) => {
                if (elem.id == 'site-settings' || elem.parentElement?.previousElementSibling?.id == 'site-settings')
                    return // never potentially disable important Site Settings
                elem.style.transition = extensionIsDisabled() ? '' : 'opacity 0.15s ease-in'
                setTimeout(() => elem.classList.toggle('disabled', extensionIsDisabled()),
                    extensionIsDisabled() ? 0 : idx *10) // fade-out abruptly, fade-in staggered
            })
        },

        configToUI(options) { return sendMsgToActiveTab('syncConfigToUI', options) }
    }

    function toggleSiteSettingsVisibility({ transitions = true } = {}) {
        const transitionDuration = 350, // ms
              toggleRows = ssTogglesDiv.querySelectorAll('.menu-entry')
        if (ssTogglesDiv.style.height == '0px') { // show toggles
            Object.assign(ssTogglesDiv.style, { height: `${dom.get.computedHeight(toggleRows)}px`,
                transition: transitions && !env.browser.isFF ? 'height 0.25s' : '' })
            Object.assign(ssLabel.caret.style, { transform: '',
                transition: transitions ? 'transform 0.15s ease-out' : '' })
            toggleRows.forEach(row => { // reset styles to support continuous transition on rapid show/hide
                row.style.transition = 'none' ; row.style.opacity = 0 })
            ssTogglesDiv.offsetHeight // force reflow to insta-apply reset
            toggleRows.forEach((row, idx) => { // fade-in staggered
                if (transitions) row.style.transition = `opacity ${ transitionDuration /1000 }s ease-in-out`
                setTimeout(() => row.style.opacity = 1, transitions ? idx * transitionDuration /10 : 0)
            })
        } else { // hide toggles
            Object.assign(ssTogglesDiv.style, { height: 0, transition: '' })
            Object.assign(ssLabel.caret.style, { transform: 'rotate(-90deg)', transition: '' })
        }
    }

    // Run MAIN routine

    // LOCALIZE extension title, set document lang
    const menuTitle = document.querySelector('.menu-title')
    menuTitle.innerText = getMsg(menuTitle.dataset.locale)
    document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0]

    // Init MASTER TOGGLE
    const masterToggle = {
        div: document.querySelector('.master-toggle'),
        switch: dom.create.elem('div', { class: 'toggle menu-icon highlight-on-hover' }),
        track: dom.create.elem('span', { class: 'track' })
    }
    masterToggle.div.append(masterToggle.switch) ; masterToggle.switch.append(masterToggle.track)
    await settings.load('extensionDisabled') ; masterToggle.switch.classList.toggle('on', !config.extensionDisabled)
    masterToggle.div.onclick = () => {
        env.extensionWasDisabled = extensionIsDisabled()
        masterToggle.switch.classList.toggle('on') ; settings.save('extensionDisabled', !config.extensionDisabled)
        Object.keys(sync).forEach(key => sync[key]()) // sync fade + storage to UI
        if (env.extensionWasDisabled ^ extensionIsDisabled()) notify(`${app.name} 🧩 ${
            getMsg(`state_${ extensionIsDisabled() ? 'off' : 'on' }`).toUpperCase()}`)
    }

    // Create CHILD menu entries on matched pages
    if (chrome.runtime.getManifest().content_scripts[0].matches.some(match => match.includes(env.site))) {
        await settings.load(sites[env.site].availFeatures)
        const childEntriesDiv = dom.create.elem('div') ; document.body.append(childEntriesDiv)
        Object.keys(settings.controls).forEach(key => {
            if (!sites[env.site].availFeatures.includes(key)) return
            const ctrlType = settings.controls[key].type,
                  ctrlStatus = settings.controls[key].status

            // Init entry's elems
            const entry = {
                div: dom.create.elem('div', {
                    class: 'menu-entry highlight-on-hover', title: settings.controls[key].helptip || '' }),
                leftElem: dom.create.elem('div', { class: `menu-icon ${ ctrlType || '' }` }),
                label: dom.create.elem('span')
            }
            entry.label.textContent = settings.controls[key].label
            entry.div.append(entry.leftElem, entry.label) ; childEntriesDiv.append(entry.div)
            if (ctrlType == 'toggle') { // add track to left, init knob pos
                entry.leftElem.append(dom.create.elem('span', { class: 'track' }))
                entry.leftElem.classList.toggle('on', settings.isEnabled(key))
            } else { // add symbol to left, append status to right
                entry.leftElem.innerText = settings.controls[key].symbol
                entry.label.innerText += ctrlStatus ? `— ${ctrlStatus }` : ''
            }

            entry.div.onclick = () => {
                if (ctrlType == 'toggle') {
                    entry.leftElem.classList.toggle('on')
                    settings.save(key, !config[key]) ; sync.configToUI({ updatedKey: key })
                    notify(`${settings.controls[key].label} ${chrome.i18n.getMessage(`state_${
                        settings.isEnabled(key) ? 'on' : 'off' }`).toUpperCase()}`)
                }
            }
        })
    }

    // Create SITE SETTINGS label
    const ssLabel = { // category label row
        div: dom.create.elem('div', { id: 'site-settings', class: 'menu-entry highlight-on-hover',
            title: settings.categories.siteSettings.helptip }),
        label: dom.create.elem('label', { class: 'menu-icon' }), labelSpan: dom.create.elem('span'),
        caret: icons.create('caretDown', { size: 11, class: 'caret',
            style: 'position: absolute ; right: 14px ; transform: rotate(-90deg)' })
    }
    ssLabel.label.innerText = '🌐' ; ssLabel.labelSpan.textContent = settings.categories.siteSettings.label
    ssLabel.div.onclick = toggleSiteSettingsVisibility;
    ['label', 'labelSpan', 'caret'].forEach(elemType => ssLabel.div.append(ssLabel[elemType]))
    document.body.append(ssLabel.div)

    // Create SITE SETTINGS toggles
    const ssTogglesDiv = dom.create.elem('div', {
        style: `border-left: 4px solid transparent ; height: 0 ; overflow: hidden ;
                border-image: linear-gradient(transparent, rgb(161 161 161)) 30 100%`
    })
    document.body.append(ssTogglesDiv)
    for (const site of Object.keys(sites)) { // create toggle per site

        // Init entry's elems
        const ssEntry = {
            div: dom.create.elem('div', { class: 'menu-entry highlight-on-hover' }),
            switchLabelDiv: dom.create.elem('div', {
                title: `${getMsg('helptip_run')} ${app.name} on ${sites[site].urls.homepage}`,
                style: `display: flex ; height: 33px ; align-items: center ; flex-grow: 1 ;
                        margin-left: -2px ; padding-left: 2px /* fill .menu-entry left-padding */` }),
            switch: dom.create.elem('div', { class: 'toggle menu-icon' }),
            track: dom.create.elem('span', { class: 'track' }), label: dom.create.elem('span'),
            faviconDiv: dom.create.elem('div', {
                title: `${getMsg('tooltip_goto')} https://${sites[site].urls.homepage}`,
                style: `display: flex ; height: 33px ; align-items: center ;
                        padding: 0 11.5px ; /* create padded rectangle for .highlight-on-hover */
                        margin-right: -14px /* fill .menu-entry right-padding */` }),
            favicon: dom.create.elem('img', { src: sites[site].urls.favicon, width: 15 }),
            openIcon: icons.create('open', { size: 16, fill: 'white' })
        }
        ssEntry.switch.append(ssEntry.track) ; ssEntry.label.textContent = sites[site].urls.homepage
        ssEntry.switchLabelDiv.append(ssEntry.switch, ssEntry.label) ; ssEntry.faviconDiv.append(ssEntry.favicon)
        ssEntry.div.append(ssEntry.switchLabelDiv, ssEntry.faviconDiv) ; ssTogglesDiv.append(ssEntry.div)
        await settings.load(`${site}Disabled`) ; ssEntry.switch.classList.toggle('on', !config[`${site}Disabled`])
        if (env.site == site) env.siteDisabled = config[`${site}Disabled`] // to auto-expand toggles later if true

        // Add listeners
        ssEntry.switchLabelDiv.onclick = () => { // toggle site setting
            env.extensionWasDisabled = extensionIsDisabled()
            ssEntry.switch.classList.toggle('on')
            settings.save(`${site}Disabled`, !config[`${site}Disabled`]) ; sync.configToUI()
            if (env.site == site) { // fade/notify if setting of active site toggled
                sync.fade()
                if (env.extensionWasDisabled ^ extensionIsDisabled()) notify(`${app.name} 🧩 ${
                    getMsg(`state_${ extensionIsDisabled() ? 'off' : 'on' }`).toUpperCase()}`)
            }
        }
        ssEntry.faviconDiv.onmouseenter = ssEntry.faviconDiv.onmouseleave = ({ type }) =>
            ssEntry.faviconDiv.firstChild.replaceWith(ssEntry[type == 'mouseenter' ? 'openIcon' : 'favicon'])
        ssEntry.faviconDiv.onclick = () => { open(`https://${sites[site].urls.homepage}`) ; close() }
    }

    // Auto-expand SITE SETTINGS conditionally
    const onMatchedPage = chrome.runtime.getManifest().content_scripts[0].matches.toString().includes(env.site)
    if (!onMatchedPage || config[`${env.site}Disabled`]) { // auto-expand Site Settings
        if (!onMatchedPage) ssLabel.div.style.pointerEvents = 'none' // disable label from triggering unneeded collapse
        setTimeout(() => toggleSiteSettingsVisibility({ transitions: onMatchedPage }),
            !onMatchedPage ? 0 // no delay since emptyish already
          : !env.browser.isFF ? 250 // some delay since other settings appear
          : 335 // more in FF since no transition
        )
    }

    sync.fade() // based on master/site toggle

    // Create/append FOOTER container
    const footer = dom.create.elem('footer') ; document.body.append(footer)

    // Create/append CHATGPT.JS footer logo
    const cjsSpan = dom.create.elem('span', { class: 'cjs-span',
        title: env.browser.displaysEnglish ? '' : `${getMsg('about_poweredBy')} chatgpt.js` })
    const cjsLogo = dom.create.elem('img', {
        src: `${app.urls.cjsAssetHost.replace('@latest', '@745f0ca')}/images/badges/powered-by-chatgpt.js.png` })
    cjsSpan.onclick = () => { open(app.urls.chatgptJS) ; close() }
    cjsSpan.append(cjsLogo) ; footer.append(cjsSpan)

    // Create/append ABOUT footer button
    const aboutSpan = dom.create.elem('span', {
        title: `${getMsg('menuLabel_about')} ${getMsg('app.name')}`,
        class: 'menu-icon highlight-on-hover', style: 'right:30px ; padding-top: 2px' })
    const aboutIcon = icons.create('questionMark', { width: 15, height: 13, style: 'margin-bottom: 0.04rem' })
    aboutSpan.onclick = () => { chrome.runtime.sendMessage({ action: 'showAbout' }) ; close() }
    aboutSpan.append(aboutIcon) ; footer.append(aboutSpan)

    // Create/append RELATED EXTENSIONS footer button
    const moreExtensionsSpan = dom.create.elem('span', {
        title:  getMsg('btnLabel_moreAIextensions'),
        class: 'menu-icon highlight-on-hover', style: 'right:2px ; padding-top: 2px' })
    const moreExtensionsIcon = icons.create('plus')
    moreExtensionsSpan.onclick = () => { open(app.urls.relatedExtensions) ; close() }
    moreExtensionsSpan.append(moreExtensionsIcon) ; footer.append(moreExtensionsSpan)

    // Remove LOADING SPINNER after imgs load
    Promise.all([...document.querySelectorAll('img')].map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)
    )).then(() => document.querySelectorAll('[class^=loading]').forEach(elem => elem.remove()))

})()
