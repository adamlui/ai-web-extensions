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
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = activeTab.url ? new URL(activeTab.url).searchParams.get('q') || 'hi' : 'hi'
    chrome.tabs.update(activeTab.id, { url: `${perplexityURL}/search/new?q=${query}` })
})

// Suggest Perplexity on short prefix entered
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (text.startsWith('@p')) suggest([{
        content: `@perplexity ${text.slice(2)}`,
        description: `${chrome.i18n.getMessage('prefix_ask')} Perplexity.ai: ${text.slice(2)}`
    }])
})

// Query Perplexity on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${perplexityURL}/search/new?q=${query}` }))
