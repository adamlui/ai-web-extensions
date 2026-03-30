(async () => {
    for (const resource of ['lib/chatgpt.min.js', 'lib/dom.min.js'])
        await import(chrome.runtime.getURL(resource))
    chrome.runtime.onMessage.addListener(async query => {
        await dom.get.loadedElem(`${chatgpt.selectors.btns.send}:not([disabled])`)
        if (new URLSearchParams(location.search).has('prompt')) // didn't auto-send
            chatgpt.send(query)
    })
})()
