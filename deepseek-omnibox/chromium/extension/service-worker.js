const deepseekChatURL = 'https://chat.deepseek.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'deddf2b' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/deepseek-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

function tabIsLoaded(tabId) {
    return new Promise(resolve => chrome.tabs.onUpdated.addListener(function loadedListener(id, info) {
        if (id == tabId && info.status == 'complete') {
            chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 500) }
    }))
}

// Launch DeepSeek Chat on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = activeTab.url ? new URL(activeTab.url).searchParams.get('q') || 'hi' : 'hi',
          updatedTab = await chrome.tabs.update(activeTab.id, { url: deepseekChatURL })
    tabIsLoaded(updatedTab.id).then(() => chrome.tabs.sendMessage(updatedTab.id, query))
})

// Suggest DeepSeek on short prefix entered
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
