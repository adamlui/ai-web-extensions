(async () => {

    // Import JS resources
    for (const resource of ['components/icons.js', 'lib/browser.js', 'lib/dom.js', 'lib/settings.js'])
        await import(chrome.runtime.getURL(resource))

    // Init ENV context
    window.env = {
        site: new URL((await chrome.tabs.query({ active: true, currentWindow: true }))[0].url)
            .hostname.split('.').slice(-2, -1)[0], // extract 2nd-level domain
        browser: {
            displaysEnglish: chrome.i18n.getUILanguage().startsWith('en'),
            isFF: navigator.userAgent.includes('Firefox')
        }
    }

    // Import DATA
    ;({ app: window.app } = await chrome.storage.local.get('app'))
    ;({ sites: window.sites } = await chrome.storage.local.get('sites'))
    app.name = env.browser.displaysEnglish ? app.name : browserAPI.getMsg('appName') // for shorter notifs

    // Define FUNCTIONS

    function createMenuEntry(entryData) {
        const entry = {
            div: dom.create.elem('div', {
                id: entryData.key, class: 'menu-entry highlight-on-hover', title: entryData.helptip || '' }),
            leftElem: dom.create.elem('div', { class: `menu-icon ${ entryData.type || '' }`}),
            label: dom.create.elem('span')
        }
        entry.label.textContent = entryData.label
        entry.div.append(entry.leftElem, entry.label)
        if (entryData.type == 'toggle') { // add track to left, init knob pos
            entry.leftElem.append(dom.create.elem('span', { class: 'track' }))
            entry.leftElem.classList.toggle('on', settings.typeIsEnabled(entryData.key))
        } else { // add symbol to left, append status to right
            entry.leftElem.textContent = entryData.symbol || '⚙️' ; entry.label.style.flexGrow = 1
            if (entryData.status) entry.label.textContent += ` — ${entryData.status}`
            if (entryData.type == 'link') {
                entry.label.after(entry.rightElem = dom.create.elem('div', { class: 'menu-right-elem' }))
                entry.rightElem.append(icons.create({ key: 'open', size: 17, fill: 'black' }))
            }
        }
        if (entryData.type == 'category')
            entry.div.append(icons.create({ key: 'caretDown', size: 11, class: 'menu-caret menu-right-elem' }))
        entry.div.onclick = ({
            category: () => toggleCategorySettingsVisiblity(entryData.key),
            toggle: () => {
                entry.leftElem.classList.toggle('on')
                settings.save(entryData.key, !config[entryData.key]) ; sync.configToUI({ updatedKey: entryData.key })
                requestAnimationFrame(() => notify(`${entryData.label} ${chrome.i18n.getMessage(`state_${
                    settings.typeIsEnabled(entryData.key) ? 'on' : 'off' }`).toUpperCase()}`))
            },
            link: () => { open(entryData.url) ; close() }
        })[entryData.type]
        return entry.div
    }

    function extensionIsDisabled() { return !!( config.extensionDisabled || config[`${env.site}Disabled`] )}

    function notify(msg, pos = !config.toastMode ? 'bottom-right' : null) {
        if (config.notifDisabled
            && !new RegExp(`${browserAPI.getMsg('menuLabel_show')} ${browserAPI.getMsg('menuLabel_notifs')}`, 'i')
                .test(msg)
        ) return
        sendMsgToActiveTab('notify', { msg, pos })
    }

    async function sendMsgToActiveTab(action, options) {
        const activeTabID = (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id
        return await chrome.tabs.sendMessage(activeTabID, { action, options })
    }

    const sync = {
        fade() {

            // Toolbar icon
            chrome.action.setIcon({ path: Object.fromEntries(
                Object.keys(chrome.runtime.getManifest().icons).map(dimension =>
                    [dimension, `../icons/${ config.extensionDisabled ? 'faded/' : '' }icon${dimension}.png`]
            ))})

            // Menu elems
            document.querySelectorAll('.logo, .menu-title, .menu-entry, .categorized-entries').forEach((elem, idx) => {
                if (elem.id &&( elem.matches(`#${elem.id}:has(> div.link)`) || /aboutEntry|siteSettings/.test(elem.id) )
                    || elem.closest('.categorized-entries')?.previousElementSibling?.id == 'siteSettings'
                ) return // never disable Site Settings + link/About entries
                elem.style.transition = extensionIsDisabled() ? '' : 'opacity 0.15s ease-in'
                setTimeout(() => elem.classList.toggle('disabled', extensionIsDisabled()),
                    extensionIsDisabled() ? 0 : idx *10) // fade-out abruptly, fade-in staggered
            })
        },

        configToUI(options) { return sendMsgToActiveTab('syncConfigToUI', options) }
    }

    function toggleCategorySettingsVisiblity(category, { transitions = true, action } = {}) {
        const transitionDuration = 350, // ms
              ctgDiv = document.getElementById(category),
              caret = ctgDiv.querySelector('.menu-caret'),
              ctgChildrenDiv = ctgDiv.nextSibling,
              ctgChild = ctgChildrenDiv.querySelectorAll('.menu-entry')
        if (action != 'hide' && dom.get.computedHeight(ctgChildrenDiv) == 0) { // show category settings
            ctgDiv.classList.toggle('expanded', true)
            Object.assign(ctgChildrenDiv.style, { height: `${dom.get.computedHeight(ctgChild)}px`,
                transition: transitions && !env.browser.isFF ? 'height 0.25s' : '' })
            Object.assign(caret.style, { // point it down
                transform: 'rotate(0deg)', transition: transitions ? 'transform 0.15s ease-out' : '' })
            ctgChild.forEach(row => { // reset styles to support continuous transition on rapid show/hide
                row.style.transition = 'none' ; row.style.opacity = 0 })
            ctgChildrenDiv.offsetHeight // force reflow to insta-apply reset
            ctgChild.forEach((row, idx) => { // fade-in staggered
                if (transitions) row.style.transition = `opacity ${ transitionDuration /1000 }s ease-in-out`
                setTimeout(() => row.style.opacity = 1, transitions ? idx * transitionDuration /10 : 0)
            })
            document.querySelectorAll(`.menu-entry:has(.menu-caret):not(#${category})`).forEach(otherCtgDiv =>
                toggleCategorySettingsVisiblity(otherCtgDiv.id, { action: 'hide' }))
        } else { // hide category settings
            ctgDiv.classList.toggle('expanded', false)
            Object.assign(ctgChildrenDiv.style, { height: 0, transition: '' })
            Object.assign(caret.style, { transform: 'rotate(-90deg)', transition: '' }) // point it right
        }
    }

    // Run MAIN routine

    // LOCALIZE text/titles, set document lang
    document.querySelectorAll('[data-locale-text-content], [data-locale-title]').forEach(elemToLocalize =>
        Object.entries(elemToLocalize.dataset).forEach(([dataAttr, dataVal]) => {
            if (!dataAttr.startsWith('locale')) return
            const propToLocalize = dataAttr[6].toLowerCase() + dataAttr.slice(7), // convert to valid DOM prop
                  localizedTxt = dataVal.split(' ').map(key => browserAPI.getMsg(key) || key).join(' ')
            elemToLocalize[propToLocalize] = localizedTxt
        })
    )
    document.documentElement.lang = chrome.i18n.getUILanguage().split('-')[0]

    // Init MASTER TOGGLE
    const masterToggle = {
        div: document.querySelector('.master-toggle'),
        switch: dom.create.elem('div', { class: 'toggle menu-icon highlight-on-hover', style: 'height: 26px' }),
        track: dom.create.elem('span', { class: 'track', style: 'position: relative ; top: 7.5px' })
    }
    masterToggle.div.append(masterToggle.switch) ; masterToggle.switch.append(masterToggle.track)
    await settings.load('extensionDisabled') ; masterToggle.switch.classList.toggle('on', !config.extensionDisabled)
    masterToggle.div.onclick = () => {
        env.extensionWasDisabled = extensionIsDisabled()
        masterToggle.switch.classList.toggle('on') ; settings.save('extensionDisabled', !config.extensionDisabled)
        Object.keys(sync).forEach(key => sync[key]()) // sync fade + storage to UI
        if (env.extensionWasDisabled ^ extensionIsDisabled()) notify(`${app.name} 🧩 ${
            browserAPI.getMsg(`state_${ extensionIsDisabled() ? 'off' : 'on' }`).toUpperCase()}`)
    }

    // Create CHILD menu entries on matched pages
    const footer = document.querySelector('footer')
    if (chrome.runtime.getManifest().content_scripts[0].matches.some(match => match.includes(env.site))) {
        await settings.load(sites[env.site].availFeatures)
        const menuEntriesDiv = dom.create.elem('div') ; footer.before(menuEntriesDiv)

        // Group controls by category
        const categorizedCtrls = {}
        Object.entries(settings.controls).forEach(([key, ctrl]) => {
            if (!sites[env.site].availFeatures.includes(key)) return
            ( categorizedCtrls[ctrl.category || 'general'] ??= {} )[key] = { ...ctrl, key }
        })

        // Create/append general controls
        Object.values(categorizedCtrls.general || {}).forEach(ctrl => menuEntriesDiv.append(createMenuEntry(ctrl)))

        // Create/append categorized controls
        Object.entries(categorizedCtrls).forEach(([category, ctrls]) => {
            if (category == 'general') return
            const ctgData = { ...settings.categories[category], key: category, type: 'category' },
                  ctgChildrenDiv = dom.create.elem('div', { class: 'categorized-entries' })
            if (ctgData.color) // color the stripe
                ctgChildrenDiv.style.borderImage = `linear-gradient(transparent, #${ctgData.color}) 30 100%`
            menuEntriesDiv.append(createMenuEntry(ctgData), ctgChildrenDiv)
            Object.values(ctrls).forEach(ctrl => ctgChildrenDiv.append(createMenuEntry(ctrl)))
        })
    }

    // Create SITE SETTINGS
    const ss = {
        labelDiv: createMenuEntry({ ...settings.categories.siteSettings, key: 'siteSettings', type: 'category' }),
        entriesDiv: dom.create.elem('div', { class: 'categorized-entries' })
    }
    footer.before(ss.labelDiv, ss.entriesDiv)
    for (const site of Object.keys(sites)) { // create toggle per site

        // Init entry's elems
        const ssEntry = {
            div: dom.create.elem('div', { class: 'menu-entry highlight-on-hover' }),
            switchLabelDiv: dom.create.elem('div', {
                title: `${browserAPI.getMsg('helptip_run')} ${app.name} on ${sites[site].urls.homepage}`,
                style: `display: flex ; height: 33px ; align-items: center ; flex-grow: 1 ;
                        margin-left: -2px ; padding-left: 2px /* fill .menu-entry left-padding */` }),
            switch: dom.create.elem('div', { class: 'toggle menu-icon' }),
            track: dom.create.elem('span', { class: 'track' }), label: dom.create.elem('span'),
            faviconDiv: dom.create.elem('div', {
                title: `${browserAPI.getMsg('tooltip_goto')} https://${sites[site].urls.homepage}`,
                class: 'menu-right-elem' }),
            favicon: dom.create.elem('img', { src: sites[site].urls.favicon, width: 15 }),
            openIcon: icons.create({ key: 'open', size: 17, fill: 'black' })
        }
        ssEntry.switch.append(ssEntry.track) ; ssEntry.label.textContent = sites[site].urls.homepage
        ssEntry.switchLabelDiv.append(ssEntry.switch, ssEntry.label) ; ssEntry.faviconDiv.append(ssEntry.favicon)
        ssEntry.div.append(ssEntry.switchLabelDiv, ssEntry.faviconDiv) ; ss.entriesDiv.append(ssEntry.div)
        await settings.load(`${site}Disabled`) ; ssEntry.switch.classList.toggle('on', !config[`${site}Disabled`])
        if (env.site == site) {
            env.siteDisabled = config[`${site}Disabled`] // to auto-expand toggles later if true
            if (config[`${site}Disabled`]) ss.labelDiv.classList.add('anchored')
        }

        // Add listeners
        ssEntry.switchLabelDiv.onclick = () => { // toggle site setting
            env.extensionWasDisabled = extensionIsDisabled()
            ssEntry.switch.classList.toggle('on')
            settings.save(`${site}Disabled`, !config[`${site}Disabled`]) ; sync.configToUI()
            ss.labelDiv.classList.toggle('anchored', env.site == site && config[`${site}Disabled`])
            if (env.site == site) { // fade/notify if setting of active site toggled
                sync.fade()
                if (env.extensionWasDisabled ^ extensionIsDisabled()) notify(`${app.name} 🧩 ${
                    browserAPI.getMsg(`state_${ extensionIsDisabled() ? 'off' : 'on' }`).toUpperCase()}`)
            }
        }
        ssEntry.faviconDiv.onmouseenter = ssEntry.faviconDiv.onmouseleave = event =>
            ssEntry.faviconDiv.firstChild.replaceWith(ssEntry[event.type == 'mouseenter' ? 'openIcon' : 'favicon'])
        ssEntry.faviconDiv.onclick = () => { open(`https://${sites[site].urls.homepage}`) ; close() }
    }

    // Create/append ABOUT entry
    const aboutEntry = {
        div: createMenuEntry({
            key: 'aboutEntry', symbol: '💡',
            label: `${settings.getMsg('menuLabel_about')}...`,
            helptip: `${settings.getMsg('menuLabel_about')} ${app.name}`
        }),
        ticker: {
            xGap: '&emsp;&emsp;&emsp;',
            span: dom.create.elem('span', { class: 'ticker' }), innerDiv: dom.create.elem('div')
        }
    }
    aboutEntry.div.querySelector('div.menu-icon').style.paddingLeft = '10px'
    aboutEntry.div.querySelector('span').style.paddingLeft = '2.5px'
    aboutEntry.ticker.content = `${
        settings.getMsg('about_version')}: <span class="ticker-em">v${ app.version + aboutEntry.ticker.xGap }</span>${
        settings.getMsg('about_poweredBy')} <span class="ticker-em">chatgpt.js</span>${aboutEntry.ticker.xGap}`
    for (let i = 0 ; i < 7 ; i++) aboutEntry.ticker.content += aboutEntry.ticker.content // make long af
    aboutEntry.ticker.innerDiv.innerHTML = aboutEntry.ticker.content
    aboutEntry.ticker.span.append(aboutEntry.ticker.innerDiv)
    aboutEntry.div.append(aboutEntry.ticker.span) ; footer.before(aboutEntry.div)
    aboutEntry.div.onclick = () => { chrome.runtime.sendMessage({ action: 'showAbout' }) ; close() }

    // Create/append COFFEE entry
    const coffeeURL = app.urls.donate['ko-fi']
    footer.before(createMenuEntry({
        key: 'coffeeEntry', type: 'link', symbol: '☕', url: coffeeURL, helptip: coffeeURL,
        label: settings.getMsg('menuLabel_buyMeAcoffee')
    }))

    // Create/append REVIEW entry
    const platform = /chromium|edge|firefox/.exec(browserAPI.runtime.toLowerCase())?.[0] || '',
          reviewURL = app.urls.review[platform != 'chromium' ? platform : 'chrome']
    footer.before(createMenuEntry({
        key: 'reviewEntry', type: 'link', symbol: '⭐', url: reviewURL, helptip: reviewURL,
        label: `${settings.getMsg('btnLabel_leaveReview')}`
    }))

    // Init FOOTER
    const footerElems = { // left-to-right
        chatgptjs: { logo: footer.querySelector('.chatgptjs-logo') },
        review: { span: footer.querySelector('span[data-locale-title="btnLabel_leaveReview"]') },
        coffee: { span: footer.querySelector('span[data-locale-title="menuLabel_buyMeAcoffee"]') },
        about: { span: footer.querySelector('span[data-locale-title="menuLabel_about appName"]') },
        moreExt: { span: footer.querySelector('span[data-locale-title=btnLabel_moreAIextensions]') }
    }
    footerElems.chatgptjs.logo.parentNode.title = env.browser.displaysEnglish ? ''
        : `${browserAPI.getMsg('about_poweredBy')} chatgpt.js` // add localized tooltip to English logo for non-English users
    footerElems.chatgptjs.logo.src = 'https://cdn.jsdelivr.net/gh/KudoAI/chatgpt.js@745f0ca'
                                   + '/assets/images/badges/powered-by-chatgpt.js.png'
    footerElems.chatgptjs.logo.onclick = () => { open(app.urls.chatgptjs) ; close() }
    footerElems.review.span.append(icons.create({key: 'star', size: 13, style: 'position: relative ; top: 1px' }))
    footerElems.review.span.onclick = () => {
        open(app.urls.review[/edge|firefox/.exec(app.runtime.toLowerCase())?.[0] || 'chrome']) ; close() }
    footerElems.coffee.span.append(
        icons.create({ key: 'coffeeCup', size: 23, style: 'position: relative ; left: 1px' }))
    footerElems.coffee.span.onclick = () => { open(app.urls.donate['ko-fi']) ; close() }
    footerElems.about.span.append(icons.create({ key: 'questionMark', width: 15, height: 13 }))
    footerElems.about.span.onclick = () => { chrome.runtime.sendMessage({ action: 'showAbout' }) ; close() }
    footerElems.moreExt.span.append(icons.create({ key: 'plus' }))
    footerElems.moreExt.span.onclick = () => { open(app.urls.relatedExtensions) ; close() }

    // AUTO-EXPAND categories
    const onMatchedPage = chrome.runtime.getManifest().content_scripts[0].matches.toString().includes(env.site)
    if (!onMatchedPage || config[`${env.site}Disabled`]) { // auto-expand Site Settings
        if (!onMatchedPage) // disable label from triggering unneeded collapse
            ss.labelDiv.classList.add('anchored')
        setTimeout(() => toggleCategorySettingsVisiblity('siteSettings', { transitions: onMatchedPage }),
            !onMatchedPage ? 0 // no delay since emptyish already
          : !env.browser.isFF ? 250 // some delay since other settings appear
          : 335 // more in FF since no transition
        )
    } else // auto-expand flagged categories
        document.querySelectorAll('.menu-entry:has(.menu-caret)').forEach(ctgDiv => {
            if (settings.categories[ctgDiv.id]?.autoExpand)
                toggleCategorySettingsVisiblity(ctgDiv.id, { transitions: false })
        })

    // Remove LOADING SPINNER after imgs load
    Promise.all([...document.querySelectorAll('img')].map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)
    )).then(() => {
        document.querySelectorAll('[class^=loading]').forEach(elem => elem.remove())
        sync.fade() // based on master/site toggle state
    })

})()
