const phindURL = 'https://www.phind.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'c375247' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/phind-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch Phind on toolbar icon click
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: phindURL }))

// Query Phind on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${phindURL}/search?q=${decodeURIComponent(query)}` }))
