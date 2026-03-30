const chatgptURL = 'https://chatgpt.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'fbedfed' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

function tabIsLoaded(tabId) {
    return new Promise(resolve => chrome.tabs.onUpdated.addListener(function loadedListener(id, { status }) {
        if (id == tabId && status == 'complete') {
            chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 500) }
    }))
}

// Launch ChatGPT on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = new URL(activeTab?.url || 'about:blank').searchParams.get('q') || chrome.i18n.getMessage('query_hi'),
          newTab = chrome.tabs.create({ url: `${chatgptURL}/?q=${query}` })
    tabIsLoaded(newTab.id).then(() => chrome.tabs.sendMessage(newTab.id, query))
})

// Query ChatGPT on omnibox query submitted
chrome.tabs.onUpdated.addListener((tabId, { status }, { url }) => {
    if (status == 'complete' && url.startsWith(chatgptURL)) {
        const query = new URL(url).searchParams.get('q')
        if (query) chrome.tabs.sendMessage(tabId, query)
    }
})
