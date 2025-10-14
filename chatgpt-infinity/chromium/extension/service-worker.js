// Init APP data
const appReady = (async () => {
    const app = {
        version: chrome.runtime.getManifest().version,
        commitHashes: { app: '2b84319' }, // for cached app.json
        runtime: (() => {
            return typeof chrome != 'undefined' && chrome.runtime ? (
                typeof browser != 'undefined' ? 'Firefox add-on'
                    : `Chromium ${ navigator.userAgent.includes('Edg') ? 'Edge add-on' : 'extension' }`
            ) : 'unknown'
        })()
    }
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-infinity@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    if (/firefox/i.test(app.runtime)) app.sourceWebStore = 'firefox'
    else { // determine Chrome or Edge store
        const self = await chrome.management.getSelf()
        if (self.updateUrl?.includes('google.com')) app.sourceWebStore = 'chrome'
        else if (self.updateUrl?.includes('microsoft.com')) app.sourceWebStore = 'edge'
    }
    chrome.storage.local.set({ app }) // save to browser storage
    chrome.runtime.setUninstallURL(app.urls.uninstall)
    return app // to install listener
})()

// Launch WELCOME PAGE on install
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason == 'install') // to exclude updates
        appReady.then(app => chrome.tabs.create({ url: app.urls.welcome + '/chromium' }))
})

// Sync SETTINGS to activated tabs
chrome.tabs.onActivated.addListener(({ tabId }) =>
    chrome.tabs.sendMessage(tabId, {
        action: 'syncConfigToUI',
        source: 'service-worker.js' // for content.js to reset config.infinityMode
}))

// Show ABOUT modal on ChatGPT when toolbar button clicked
chrome.runtime.onMessage.addListener(async ({ action }) => {
    if (action == 'showAbout') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const chatgptTab = new URL(activeTab.url).hostname == 'chatgpt.com' ? activeTab
                         : await chrome.tabs.create({ url: 'https://chatgpt.com' })
        if (activeTab != chatgptTab) await new Promise(resolve => // after new tab loads
            chrome.tabs.onUpdated.addListener(function loadedListener(tabId, { status }) {
                if (tabId == chatgptTab.id && status == 'complete') {
                    chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 1500)
        }}))
        chrome.tabs.sendMessage(chatgptTab.id, { action: 'showAbout', source: 'service-worker.js' })
    }
})
