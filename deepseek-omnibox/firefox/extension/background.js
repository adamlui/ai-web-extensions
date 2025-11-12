const deepseekChatURL = 'https://chat.deepseek.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'cb69047' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/deepseek-omnibox@${app.commitHashes.app}` }
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

// Launch DeepSeek Chat on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = activeTab.url ? new URL(activeTab.url).searchParams.get('q') || 'hi' : 'hi',
          newTab = await chrome.tabs.create({ url: deepseekChatURL })
    tabIsLoaded(newTab.id).then(() => chrome.tabs.sendMessage(newTab.id, query))
})

// Suggest DeepSeek on short prefix used
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (text.startsWith('@d')) suggest([{
        content: `@deepseek ${text.slice(2)}`,
        description: `${chrome.i18n.getMessage('prefix_ask')} DeepSeek AI: ${text.slice(2)}`
    }])
})

// Query DeepSeek on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(async query => {
    const tab = await chrome.tabs.update({ url: deepseekChatURL })
    tabIsLoaded(tab.id).then(() => chrome.tabs.sendMessage(tab.id, query))
})
