const youDotComURL = 'https://you.com/'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: '4aee7ec' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/you.com-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch You.com on toolbar icon click
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: youDotComURL }))

// Query You.com on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${youDotComURL}/search?q=${decodeURIComponent(query)}&tbm=youchat` }))
