const deepseekChatURL = 'https://chat.deepseek.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'deddf2b' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/deepseek-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch DeepSeek Chat on toolbar icon click
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: deepseekChatURL }))

// Query DeepSeek on omnibox query submitted
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab.url.startsWith(deepseekChatURL)) {
        const query = new URL(tab.url).searchParams.get('q')
        if (query) chrome.tabs.sendMessage(tabId, query)
    }
})
