const chatgptURL = 'https://chatgpt.com'

// Init APP data
;(async () => {
    const app = { commitHashes: { app: 'fbedfed' }} // for cached app.json
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/adamlui/chatgpt-omnibox@${app.commitHashes.app}` }
    const remoteAppData = await (await fetch(`${app.urls.resourceHost}/assets/data/app.json`)).json()
    Object.assign(app, { ...remoteAppData, urls: { ...app.urls, ...remoteAppData.urls }})
    chrome.runtime.setUninstallURL(app.urls.uninstall)
})()

// Launch ChatGPT on toolbar icon click
chrome.action.onClicked.addListener(async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }),
          query = activeTab.url ? new URL(activeTab.url).searchParams.get('q') || 'hi' : 'hi'
    chrome.tabs.update(activeTab.id, { url: `${chatgptURL}/?q=${query}` })
})

// Suggest ChatGPT on short prefix used
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (text.startsWith('@c')) suggest([{
        content: `@chatgpt ${text.slice(2)}`,
        description: `${chrome.i18n.getMessage('prefix_ask')} ChatGPT: ${text.slice(2)}`
    }])
})

// Query ChatGPT on omnibox query submitted
chrome.omnibox.onInputEntered.addListener(query =>
    chrome.tabs.update({ url: `${chatgptURL}/?q=${query}` }))
