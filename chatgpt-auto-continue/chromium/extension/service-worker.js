// Init APP data
const appReady = (async () => {
    const app = {
        version: chrome.runtime.getManifest().version,
        commitHashes: { app: '4dd9d96' }, // for cached app.json
        runtime: (() => {
            return typeof chrome != 'undefined' && chrome.runtime ? (
                typeof browser != 'undefined' ? 'Firefox add-on'
                    : `Chromium ${ navigator.userAgent.includes('Edg') ? 'Edge add-on' : 'extension' }`
            ) : 'unknown'
        })()
    }
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-auto-continue@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.storage.local.set({ app }) // save to browser storage
    chrome.runtime.setUninstallURL(app.urls.uninstall)
    return app // to install listener
})()

// Launch WELCOME PAGE on install
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == 'install') // to exclude updates
        appReady.then(app => chrome.tabs.create({ url: app.urls.welcome + '/chromium' }))
})

// Sync SETTINGS to activated tabs
chrome.tabs.onActivated.addListener(activeInfo =>
    chrome.tabs.sendMessage(activeInfo.tabId, { action: 'syncConfigToUI' }))

// Show ABOUT modal on ChatGPT when toolbar button clicked
chrome.runtime.onMessage.addListener(async req => {
    if (req.action == 'showAbout') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const chatgptTab = new URL(activeTab.url).hostname == 'chatgpt.com' ? activeTab
            : await chrome.tabs.create({ url: 'https://chatgpt.com/' })
        if (activeTab != chatgptTab) await new Promise(resolve => // after new tab loads
            chrome.tabs.onUpdated.addListener(function loadedListener(tabId, changeInfo) {
                if (tabId == chatgptTab.id && changeInfo.status == 'complete') {
                    chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 500)
        }}))
        chrome.tabs.sendMessage(chatgptTab.id, { action: 'showAbout' })
    }
})
