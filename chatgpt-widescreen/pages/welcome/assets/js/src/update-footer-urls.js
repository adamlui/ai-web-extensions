(() => {
    const app = { urls: { appData: 'https://cdn.jsdelivr.net/gh/adamlui/chatgpt-widescreen/assets/data/app.json' }}
    fetch(app.urls.appData)
        .then(resp => resp.ok ? resp.json() : Promise.reject(`HTTP error! status: ${resp.status}`))
        .then(data => { Object.assign(app.urls, data.urls || {}) ; updateFooterLinks() })
        .catch(console.error)

        function updateFooterLinks() {
            if (!app.urls.support || !app.urls.review) return
            document.querySelectorAll('.footer-links a').forEach(link =>
                link.href = link.id.includes('support') ? app.urls.support
                          : link.id.includes('review') ? app.urls.review[
                                navigator.userAgent.includes('Edg') ? 'edge' : 'chrome']
                          : link.href // don't update other links
            )
        }
})();
