const braveURL = 'https://search.brave.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: '3355fc1' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/brave-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch Brave Search on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = new URL(activeTab?.url || 'about:blank').searchParams.get('q') || chrome.i18n.getMessage('query_hi')
    chrome.tabs.create({ url: `${braveURL}/ask?q=${query}` })
})
