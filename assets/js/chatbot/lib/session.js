 // Requires lib/<crypto-js|feedback>.js + <app|env|get|log|Math> + GM_cookie + GM_<delete|get|set>Value()

window.session = {

    deleteOpenAIcookies() { // requires <app|env> + GM_<cookie|deleteValue>
        log.caller = 'session.deleteOpenAIcookies()'
        log.debug('Deleting OpenAI cookies...')
        GM_deleteValue(app.configKeyPrefix + '_openAItoken')
        if (env.scriptManager.name != 'Tampermonkey') return
        GM_cookie.list({ url: app.apis.OpenAI.endpoints.auth }, (cookies, error) => {
            if (!error) { for (const cookie of cookies) {
                GM_cookie.delete({ url: app.apis.OpenAI.endpoints.auth, name: cookie.name })
        }}})
    },

    getOAItoken() { // requires lib/feedback.js + <app|env|get|log> + GM_<get|set>Value()
        log.caller = 'session.getOAItoken()'
        log.debug('Getting OpenAI token...')
        return new Promise(resolve => {
            const accessToken = GM_getValue(app.configKeyPrefix + '_openAItoken')
            if (accessToken) { log.debug(accessToken) ; resolve(accessToken) }
            else {
                log.debug(`No token found. Fetching from ${app.apis.OpenAI.endpoints.session}...`)
                env.xhr({
                    url: app.apis.OpenAI.endpoints.session,
                    onload: ({ responseText }) => {
                        if (session.isBlockedByCF(responseText)) return feedback.appAlert('checkCloudflare')
                        try {
                            const newAccessToken = JSON.parse(responseText).accessToken
                            GM_setValue(app.configKeyPrefix + '_openAItoken', newAccessToken)
                            log.debug(`Success! newAccessToken = ${newAccessToken}`)
                            resolve(newAccessToken)
                        } catch { if (get.reply.api == 'OpenAI') return feedback.appAlert('login') }
                    }
                })
            }
        })
    },

    isBlockedByCF(resp) { // requires log
        try {
            const html = new DOMParser().parseFromString(resp, 'text/html'),
                    title = html.querySelector('title')
            if (title.textContent == 'Just a moment...') {
                log.caller = 'session.isBlockedByCF'
                return log.debug('Blocked by CloudFlare') || true
            }
        } catch (err) { return false }
    }
};
