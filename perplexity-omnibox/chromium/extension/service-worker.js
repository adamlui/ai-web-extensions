const perplexityURL = 'https://www.perplexity.ai'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: '2d6f432' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/perplexity-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch Perplexity on toolbar icon click
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: perplexityURL }))

// Query Perplexity on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${perplexityURL}/search/new?q=${decodeURIComponent(query)}` }))
