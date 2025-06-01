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
chrome.omnibox.onInputEntered.addListener(query => {
    chrome.tabs.update({ url: deepseekChatURL }, async tab => {
        await new Promise(resolve => // after chat page finishes loading
            chrome.tabs.onUpdated.addListener(function loadedListener(tabId, info) {
                if (info.status == 'complete') {
                    chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 500)
        }}))
        chrome.tabs.sendMessage(tab.id, query)
    })
})
