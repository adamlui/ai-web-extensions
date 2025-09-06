 // Requires lib/<crypto-js|feedback>.js + <apis|app|env|get|log|Math|xhr> + GM_cookie + GM_<delete|get|set>Value()

window.session = {

    deleteOpenAIcookies() { // requires <apis|app|env> + GM_<cookie|deleteValue>
        log.caller = 'session.deleteOpenAIcookies()'
        log.debug('Deleting OpenAI cookies...')
        GM_deleteValue(app.configKeyPrefix + '_openAItoken')
        if (env.scriptManager.name != 'Tampermonkey') return
        GM_cookie.list({ url: apis.OpenAI.endpoints.auth }, (cookies, error) => {
            if (!error) { for (const cookie of cookies) {
                GM_cookie.delete({ url: apis.OpenAI.endpoints.auth, name: cookie.name })
        }}})
    },

    generateGPTFLkey() { // requires lib/crypto-js.js + <log|Math>
        log.caller = 'session.generateGPTFLkey()'
        log.debug('Generating GPTforLove key...')
        let nn = Math.floor(new Date().getTime() / 1e3)
        const fD = e => {
            let t = CryptoJS.enc.Utf8.parse(e),
                o = CryptoJS.AES.encrypt(t, 'vrewbhjvbrejhbevwjh156645', {
                    mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7
            })
            return o.toString()
        }
        const gptflKey = fD(nn)
        return log.debug(gptflKey) || gptflKey
    },

    getOAItoken() { // requires lib/feedback.js + <apis|app|get|log|xhr> + GM_<get|set>Value()
        log.caller = 'session.getOAItoken()'
        log.debug('Getting OpenAI token...')
        return new Promise(resolve => {
            const accessToken = GM_getValue(app.configKeyPrefix + '_openAItoken')
            if (accessToken) { log.debug(accessToken) ; resolve(accessToken) }
            else {
                log.debug(`No token found. Fetching from ${apis.OpenAI.endpoints.session}...`)
                xhr({
                    url: apis.OpenAI.endpoints.session,
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
