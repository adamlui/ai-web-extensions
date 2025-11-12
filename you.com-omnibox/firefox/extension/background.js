const youURL = 'https://you.com/'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: '4aee7ec' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/you.com-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch You.com on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = new URL(activeTab?.url || 'about:blank').searchParams.get('q') || chrome.i18n.getMessage('query_hi')
    chrome.tabs.create({ url: `${youURL}/search?q=${query}&tbm=youchat` })
})

// Suggest You.com on short prefix used
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (text.startsWith('@y')) suggest([{
        content: `@you ${text.slice(2)}`,
        description: `${chrome.i18n.getMessage('prefix_ask')} You.com AI: ${text.slice(2)}`
    }])
})

// Query You.com on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${youURL}/search?q=${query}&tbm=youchat` }))
