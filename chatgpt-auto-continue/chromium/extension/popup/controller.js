(async () => {

    // Import JS resources
    for (const resource of ['components/icons.js', 'lib/dom.js', 'lib/settings.js'])
        await import(chrome.runtime.getURL(resource))

    // Init ENV context
    const env = {
        site: new URL((await chrome.tabs.query({ active: true, currentWindow: true }))[0].url)
            .hostname.split('.').slice(-2, -1)[0], // extract 2nd-level domain
        browser: { displaysEnglish: chrome.i18n.getUILanguage().startsWith('en') }
    }

    // Import DATA
    const { app } = await chrome.storage.local.get('app')
    icons.import({ app }) // for src's using app.urls.assetHost

    // Define FUNCTIONS

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
                elem.style.transition = config.extensionDisabled ? '' : 'opacity 0.15s ease-in'
                setTimeout(() => elem.classList.toggle('disabled', config.extensionDisabled),
                    config.extensionDisabled ? 0 : idx *10) // fade-out abruptly, fade-in staggered
            })
        },

        configToUI(options) { return sendMsgToActiveTab('syncConfigToUI', options) }
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
        env.extensionWasDisabled = config.extensionDisabled
        masterToggle.switch.classList.toggle('on') ; settings.save('extensionDisabled', !config.extensionDisabled)
        Object.keys(sync).forEach(key => sync[key]()) // sync fade + storage to UI
        notify(`${getMsg('appName')} 🧩 ${ getMsg(`state_${ config.extensionDisabled ? 'off' : 'on' }`).toUpperCase()}`)
    }

    // Create CHILD menu entries on chatgpt.com
    if (env.site == 'chatgpt') {
        const childEntriesDiv = dom.create.elem('div') ; document.body.append(childEntriesDiv)
        await settings.load(Object.keys(settings.controls))
        Object.keys(settings.controls).forEach(key => {
            const ctrl = settings.controls[key]

            // Init entry's elems
            const entry = {
                div: dom.create.elem('div', {
                    class: 'menu-entry highlight-on-hover', title: ctrl.helptip || '' }),
                leftElem: dom.create.elem('div', { class: `menu-icon ${ ctrl.type || '' }` }),
                label: dom.create.elem('span')
            }
            entry.label.textContent = ctrl.label
            entry.div.append(entry.leftElem, entry.label) ; childEntriesDiv.append(entry.div)
            if (ctrl.type == 'toggle') { // add track to left, init knob pos
                entry.leftElem.append(dom.create.elem('span', { class: 'track' }))
                entry.leftElem.classList.toggle('on', settings.typeIsEnabled(key))
            } else { // add symbol to left, append status to right
                entry.leftElem.innerText = ctrl.symbol
                entry.label.innerText += ctrl.status ? ` — ${ctrl.status}` : ''
            }

            entry.div.onclick = () => {
                if (ctrl.type == 'toggle') {
                    entry.leftElem.classList.toggle('on')
                    settings.save(key, !config[key]) ; sync.configToUI({ updatedKey: key })
                    notify(`${ctrl.label} ${chrome.i18n.getMessage(`state_${
                        settings.typeIsEnabled(key) ? 'on' : 'off' }`).toUpperCase()}`)
                }
            }
        })
    }

    sync.fade() // based on master toggle

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
        title: `${getMsg('menuLabel_about')} ${getMsg('appName')}`,
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
