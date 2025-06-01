// Init APP data
(async () => {
    const app = { commitHashes: { app: 'fbedfed' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch ChatGPT on toolbar icon click
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: 'https://chatgpt.com' }))
