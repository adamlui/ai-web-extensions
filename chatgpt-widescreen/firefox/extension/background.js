// Init DATA
(async () => {

    // Init APP data
    const app = {
        version: chrome.runtime.getManifest().version,
        commitHashes: { app: 'fd9aa83' } // for cached app.json + sites.json5
    }
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-widescreen@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    app.sourceWebStore = navigator.userAgent.includes('Firefox') ? 'firefox'
        : (await chrome.management.getSelf()).updateUrl?.includes('google.com') ? 'chrome' : 'edge'
    chrome.storage.local.set({ app }) // save to browser storage
    chrome.runtime.setUninstallURL(app.urls.uninstall)

    // Init SITES data
    const sites = Object.assign(Object.create(null),
        JSON5.parse(await (await fetch(`${app.urls.resourceHost}/assets/data/sites.json5`)).text()))
    Object.keys(sites).forEach(site => // strip protocol from homepage URL for cleaner tooltips/labels
        sites[site].urls.homepage = sites[site].urls.homepage.replace(/^https?:\/\//, ''))
    chrome.storage.local.set({ sites })

})()

// Launch CHATGPT on install
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason == 'install') // to exclude updates
        chrome.tabs.create({ url: 'https://chatgpt.com/' })
})

// Sync SETTINGS/MODES to activated tabs
chrome.tabs.onActivated.addListener(({ tabId }) =>
    chrome.tabs.sendMessage(tabId, { action: 'syncConfigToUI' }))

// Show ABOUT modal on AI site when toolbar button clicked
const aiHomeURLs = chrome.runtime.getManifest().content_scripts[0].matches.map(url => url.replace(/\*$/, ''))
chrome.runtime.onMessage.addListener(async ({ action }) => {
    if (action == 'showAbout') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const aiTab = aiHomeURLs.some(aiURL =>
            new URL(activeTab.url).hostname == new URL(aiURL).hostname) ? activeTab // active tab is AI site, use it
                : // else use random enabled site or ChatGPT
                    await chrome.storage.local.get(['chatgptDisabled', 'poeDisabled'])
                        .then(({ chatgptDisabled, poeDisabled }) => {
                            const sitesEnabled = [!chatgptDisabled && aiHomeURLs[0], !poeDisabled && aiHomeURLs[1]]
                                .filter(Boolean)
                            return chrome.tabs.create({
                                url: sitesEnabled[Math.floor(Math.random() * sitesEnabled.length)] || aiHomeURLs[0] })
                        })
        if (activeTab != aiTab) await new Promise(resolve => // after new tab loads
            chrome.tabs.onUpdated.addListener(function loadedListener(tabId, { status }) {
                if (tabId == aiTab.id && status == 'complete') {
                    chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 1500)
        }}))
        chrome.tabs.sendMessage(aiTab.id, { action: 'showAbout', source: 'background.js' })
    }
})
