// Requires lib/generate-ip.js + <apis|app|config|cryptoJS|get|log|show>

window.api = {

    clearTimedOut(triedAPIs) { // to retry on new queries
        triedAPIs.splice(0, triedAPIs.length, // empty apiArray
            ...triedAPIs.filter(entry => Object.values(entry)[0] != 'timeout')) // replace w/ err'd APIs
    },

    createHeaders(api) { // requires lib/generate-ip.js + apis
        const ip = ipv4.generate({ verbose: false })
        const headers = {
            'Accept': '*/*', 'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Connection': 'keep-alive', 'DNT': '1',
            'Origin': apis[api].expectedOrigin.url, 'X-Forwarded-For': ip, 'X-Real-IP': ip
        }
        headers.Referer = headers.Origin + '/'
        if (apis[api].method == 'POST') Object.assign(headers, {
            'Content-Type': 'application/json',
            'Host': new URL(apis[api].endpoints?.completions || apis[api].endpoint).hostname,
            'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-Dest': 'empty', 'Sec-Fetch-Mode': 'cors'
        })
        Object.assign(headers, apis[api].expectedOrigin.headers) // API-specific ones
        if (api == 'OpenAI') headers.Authorization = `Bearer ${config.openAIkey}`
        return headers
    },

    createReqData(api, msgs) { // returns payload for POST / query string for GET // requires <apis|CryptoJS|log>
        log.caller = `api.createReqData('${api}', msgs)`
        msgs = msgs.map(({ api, regenerated, time, ...rest }) => rest) // eslint-disable-line no-unused-vars
        const time = Date.now(), lastUserMsg = msgs[msgs.length - 1]
        const reqData = api == 'OpenAI' ? { messages: msgs, model: 'gpt-3.5-turbo', max_tokens: 4000 }
            : api == 'AIchatOS' ? {
                network: true, prompt: lastUserMsg.content,
                userId: apis.AIchatOS.userID, withoutContext: false
        } : api == 'FREEGPT' ? {
                messages: msgs, pass: null,
                sign: CryptoJS.SHA256(`${time}:${lastUserMsg.content}:`).toString(CryptoJS.enc.Hex),
                time: time
        } : api == 'GPTforLove' ? {
                prompt: lastUserMsg.content, secret: session.generateGPTFLkey(),
                systemMessage: 'You are ChatGPT, the version is GPT-4o, a large language model trained by OpenAI. '
                                + 'Follow the user\'s instructions carefully. '
                                + `${prompts.create('language', { mods: 'noChinese' })} `
                                + `${prompts.create('humanity', { mods: 'all' })} `,
                temperature: 0.8, top_p: 1
        } : api == 'MixerBox AI' ? { model: 'gpt-3.5-turbo', prompt: msgs }
            : apis[api].method == 'GET' ? encodeURIComponent(lastUserMsg.content) : null
        if (api == 'GPTforLove' && apis.GPTforLove.parentID) // include parentID for contextual replies
            reqData.options = { parentMessageId: apis.GPTforLove.parentID }
        return log.debug(reqData) || reqData
    },

    pick(caller) { // requires <apis|config|get|log>
        log.caller = `get.${caller.name}() » api.pick()`
        const untriedAPIs = Object.keys(apis).filter(api =>
            !caller.triedAPIs.some(entry => // exclude tried APIs
                Object.prototype.hasOwnProperty.call(entry, api))
                && ( caller == get.related || ( // handle get.reply exclusions
                    api != 'OpenAI' // exclude OpenAI since api.pick in get.reply only in Proxy Mode
                    && ( // exclude unpreferred APIs if config.preferredAPI
                        !config.preferredAPI || api == config.preferredAPI)
                    && ( // exclude unstreamable APIs if !config.streamingDisabled
                        config.streamingDisabled || apis[api].streamable)
                    && !( // exclude GET APIs if msg history established while not shuffling
                        apis[api].method == 'GET' && get.reply.src != 'shuffle' && app.msgChain.length > 2)
                    && !( // exclude APIs that don't support long prompts while summarizing
                        get.reply.src == 'summarize' && apis[api].supportsLongPrompts == false)
                ))
        )
        const chosenAPI = untriedAPIs[ // pick random array entry
            Math.floor(chatgpt.randomFloat() * untriedAPIs.length)]
        if (!chosenAPI) { return log.error('No proxy APIs left untried') || null }
        log.debug('Endpoint chosen', apis[chosenAPI].endpoints?.completions || apis[chosenAPI].endpoint)
        return chosenAPI
    },

    process: {
        initFailFlags(api) { return apis[api].respPatterns?.fail ? new RegExp(apis[api].respPatterns.fail) : null },

        stream(resp, { caller, callerAPI }) { // requires <apis|app|config|env|log|show>
            log.caller = `api.process.stream(resp, { caller: get.${caller.name}, callerAPI: '${callerAPI}' })`
            if (config.streamingDisabled || !config.proxyAPIenabled) return
            const reader = resp.response.getReader(), reFailFlags = this.initFailFlags(callerAPI)
            let textToShow = '', isDone = false
            reader.read().then(chunk => handleChunk(chunk, callerAPI))
                .catch(err => log.error('Error processing stream', err.message))

            function handleChunk({ done, value }, callerAPI) {

                // Handle stream done
                const respChunk = new TextDecoder('utf8').decode(new Uint8Array(value))
                if (done || respChunk.includes(apis[callerAPI].respPatterns?.watermark))
                    return handleProcessCompletion()
                if (env.browser.isChromium) { // clear/add timeout since Chromium stream reader doesn't signal done
                    clearTimeout(this.timeout) ; this.timeout = setTimeout(handleProcessCompletion, 1500) }

                // Process/accumulate reply chunk
                if (!apis[callerAPI].parsingRequired) textToShow += respChunk
                else { // parse structured chunk(s)
                    let replyChunk = ''
                    if (callerAPI == 'GPTforLove') { // extract parentID + deltas
                        const chunkObjs = respChunk.trim().split('\n').map(line => JSON.parse(line))
                        if (typeof chunkObjs[0].text == 'undefined') // error response
                            replyChunk = JSON.stringify(chunkObjs[0]) // for fail flag check
                        else { // AI response
                            apis.GPTforLove.parentID = chunkObjs[0].id || null // for contextual replies
                            chunkObjs.forEach(obj => replyChunk += obj.delta || '') // accumulate AI reply text
                        }
                    } else if (callerAPI == 'MixerBox AI') // extract/normalize AI reply data
                        replyChunk = [...respChunk.matchAll(/data:(.*)/g)] // arrayify data
                            .filter(match => !/message_(?:start|end)|done/.test(match)) // exclude signals
                            .map(match => // normalize whitespace
                                match[1].replace(/\[SPACE\]/g, ' ').replace(/\[NEWLINE\]/g, '\n'))
                            .join('') // stringify AI reply text
                    textToShow += replyChunk
                    const donePattern = apis[callerAPI].respPatterns?.done
                    isDone = donePattern ? new RegExp(donePattern).test(respChunk) : false
                }

                // Show accumulated reply chunks
                try {
                    const failMatch = reFailFlags?.exec(textToShow)
                    if (failMatch) {
                        log.debug('Text to show', textToShow) ; log.error('Fail flag detected', `'${failMatch[0]}'`)
                        if (env.browser.isChromium) clearTimeout(this.timeout) // skip handleProcessCompletion()
                        if (caller.status != 'done' && !caller.sender) return api.tryNew(caller)
                    } else if (caller.status != 'done') { // app waiting or sending
                        caller.sender = caller.sender || callerAPI // app is waiting, become sender
                        if (caller.sender == callerAPI // app is sending from this api
                            && textToShow.trim() != '' // empty reply chunk not read
                        ) show.reply({ content: textToShow, footerContent: app.footerContent, apiUsed: callerAPI })
                    }
                } catch (err) { log.error('Error showing stream', err.message) }

                function handleProcessCompletion() {
                    if (env.browser.isChromium) clearTimeout(this.timeout)
                    if (app.div.querySelector('.loading')) // no text shown
                        api.tryNew(caller)
                    else { // text was shown
                        show.codeCornerBtns()
                        if (callerAPI == caller.sender) app.msgChain.push({
                            time: Date.now(), role: 'assistant', content: textToShow, api: callerAPI,
                            regenerated: app.msgChain[app.msgChain.length -1]?.role == 'assistant'
                        })
                        api.clearTimedOut(caller.triedAPIs) ; clearTimeout(caller.timeout)
                        caller.status = 'done' ; caller.sender = caller.attemptCnt = null
                    }
                }

                // handleProcessCompletion() or read next chunk
                return isDone ? handleProcessCompletion() // from API's custom signal
                    : reader.read().then(nextChunk => {
                        if (caller.sender == callerAPI) handleChunk(nextChunk, callerAPI) // recurse
                    }).catch(err => log.error('Error reading stream', err.message))
            }
        },

        text(resp, { caller, callerAPI }) {
            log.caller = `api.process.text(resp, { caller: get.${caller.name}, callerAPI: '${callerAPI}' })`
            return new Promise(resolve => {
                if (caller == get.reply && config.proxyAPIenabled && !config.streamingDisabled
                    || caller.status == 'done') return
                const reFailFlags = this.initFailFlags(callerAPI) ; let textToShow = ''
                if (resp.status != 200) {
                    log.error('Response status', resp.status)
                    log.info('Response text', resp.response || resp.responseText)
                    if (caller == get.reply && callerAPI == 'OpenAI')
                        feedback.appAlert(resp.status == 401 ? 'login'
                                : resp.status == 403 ? 'checkCloudflare'
                                : resp.status == 429 ? ['tooManyRequests', 'suggestProxy']
                                                    : ['OpenAI', 'notWorking', 'suggestProxy'] )
                    else api.tryNew(caller)
                } else if (callerAPI == 'OpenAI' && resp.response) { // show response or return RQs from OpenAI
                    try { // to show response or return RQs
                        textToShow = JSON.parse(resp.response).choices[0].message.content
                        handleProcessCompletion()
                    } catch (err) { handleProcessError(err) }
                } else if (resp.responseText) { // show response or return RQs from proxy API
                    if (!apis[callerAPI].parsingRequired) {
                        textToShow = resp.responseText ; handleProcessCompletion() }
                    else { // parse structured responseText
                        if (callerAPI == 'GPTforLove') {
                            try {
                                const chunkLines = resp.responseText.trim().split('\n'),
                                    lastChunkObj = JSON.parse(chunkLines[chunkLines.length -1])
                                apis.GPTforLove.parentID = lastChunkObj.id || null
                                textToShow = lastChunkObj.text ; handleProcessCompletion()
                            } catch (err) { handleProcessError(err) }
                        } else if (callerAPI == 'MixerBox AI') {
                            try {
                                textToShow = [...resp.responseText.matchAll(/data:(.*)/g)] // arrayify data
                                    .filter(match => !/message_(?:start|end)|done/.test(match)) // exclude signals
                                    .map(match => // normalize whitespace
                                        match[1].replace(/\[SPACE\]/g, ' ').replace(/\[NEWLINE\]/g, '\n'))
                                    .join('') // stringify AI reply text
                                handleProcessCompletion()
                            } catch (err) { handleProcessError(err) }
                        }
                    }
                } else if (caller.status != 'done') { // proxy 200 response failure
                    log.info('Response text', resp.responseText) ; api.tryNew(caller) }

                function handleProcessCompletion() {
                    if (caller.status != 'done') {
                        log.debug('Text to show', textToShow)
                        const failMatch = reFailFlags?.exec(textToShow)
                        if (!textToShow || failMatch) {
                            if (textToShow) {
                                log.debug('Text to show', textToShow)
                                log.error('Fail flag detected', `'${failMatch[0]}'`)
                            }
                            api.tryNew(caller)
                        } else {
                            caller.status = 'done' ; caller.attemptCnt = null
                            api.clearTimedOut(caller.triedAPIs) ; clearTimeout(caller.timeout)
                            textToShow = textToShow.replace(apis[callerAPI].respPatterns?.watermark, '').trim()
                            if (caller == get.reply) {
                                show.reply({
                                    content: textToShow, footerContent: app.footerContent , apiUsed: callerAPI })
                                show.codeCornerBtns()
                                app.msgChain.push({
                                    time: Date.now(), role: 'assistant', content: textToShow, api: callerAPI,
                                    regenerated: app.msgChain[app.msgChain.length -1]?.role == 'assistant'
                                })
                            } else resolve(arrayify(textToShow))
                        }
                    }
                }

                function handleProcessError(err) { // suggest proxy or try diff API
                    log.debug('Response text', resp.response) ; log.error(app.alerts.parseFailed, err)
                    if (callerAPI == 'OpenAI' && caller == get.reply)
                        feedback.appAlert('OpenAI', 'notWorking', 'suggestProxy')
                    else api.tryNew(caller)
                }

                /* eslint-disable regexp/no-super-linear-backtracking */
                function arrayify(strList) { // for get.related() calls
                    log.caller = 'api.process.text » arrayify()'
                    log.debug('Arrayifying related queries...')
                    return (strList.trim().match(/^\d+\.?\s*([^\n]+?)(?=\n|\\n|$)/gm) || [])
                        .slice(0, 5) // limit to 1st 5
                        .map(match => match.replace(/\*\*/g, '') // strip markdown boldenings
                            .replace(/^['"]*(?:\d+\.?\s*)?['"]*(.*?)['"]*$/g, '$1')) // strip numbering + quotes
                } /* eslint-enable regexp/no-super-linear-backtracking */
        })}
    },

    tryNew(caller, reason = 'err') {
        log.caller = `get.${caller.name}() » api.tryNew()`
        if (caller.status == 'done') return
        log.error(`Error using ${ apis[caller.api].endpoints?.completions
                                || apis[caller.api].endpoint } due to ${reason}`)
        caller.triedAPIs.push({ [caller.api]: reason })
        if (caller.attemptCnt < Object.keys(apis).length -+(caller == get.reply)) {
            log.debug('Trying another endpoint...')
            caller.attemptCnt++
            caller(caller == get.reply ? { msgs: app.msgChain, src: caller.src } : get.related.query)
                .then(result => { if (caller == get.related) show.related(result) ; else return })
        } else {
            log.debug('No remaining untried endpoints')
            if (caller == get.reply)
                feedback.appAlert(`${ config.preferredAPI ? 'api' : 'proxy' }NotWorking`,
                    `suggest${ config.preferredAPI ? 'DiffAPI' : 'OpenAI' }`)
        }
    }
};
