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
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = activeTab.url ? new URL(activeTab.url).searchParams.get('q') || 'hi' : 'hi'
    chrome.tabs.update(activeTab.id, { url: `${phindURL}/search?q=${query}` })
})
