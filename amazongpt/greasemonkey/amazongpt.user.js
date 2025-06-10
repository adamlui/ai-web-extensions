// ==UserScript==
// @name                   AmazonGPT 🤖
// @description            Add AI chat & product/category summaries to Amazon shopping, powered by the latest LLMs like GPT-4o!
// @author                 KudoAI
// @namespace              https://kudoai.com
// @version                2025.6.9.1
// @license                MIT
// @icon                   https://amazongpt.kudoai.com/assets/images/icons/app/black-gold-teal/icon48.png?v=8e8ed1c
// @icon64                 https://amazongpt.kudoai.com/assets/images/icons/app/black-gold-teal/icon64.png?v=8e8ed1c
// @compatible             brave
// @compatible             chrome
// @compatible             chromebeta
// @compatible             chromecanary
// @compatible             chromedev
// @compatible             edge
// @compatible             edgebeta
// @compatible             edgecanary
// @compatible             edgedev
// @compatible             fennec
// @compatible             firefox
// @compatible             firefoxbeta
// @compatible             firefoxnightly
// @compatible             ghost
// @compatible             iceraven
// @compatible             ironfox
// @compatible             lemur
// @compatible             librewolf
// @compatible             mises
// @compatible             opera
// @compatible             operaair
// @compatible             operagx
// @compatible             orion
// @compatible             qq
// @compatible             quetta
// @compatible             safari
// @compatible             vivaldi
// @compatible             waterfox
// @compatible             whale
// @match                  *://www.amazon.com/*
// @match                  *://www.amazon.ae/*
// @match                  *://www.amazon.com.be/*
// @match                  *://www.amazon.ca/*
// @match                  *://www.amazon.cn/*
// @match                  *://www.amazon.co.jp/*
// @match                  *://www.amazon.co.uk/*
// @match                  *://www.amazon.co.za/*
// @match                  *://www.amazon.com.au/*
// @match                  *://www.amazon.com.br/*
// @match                  *://www.amazon.com.mx/*
// @match                  *://www.amazon.com.tr/*
// @match                  *://www.amazon.com/*
// @match                  *://www.amazon.de/*
// @match                  *://www.amazon.eg/*
// @match                  *://www.amazon.es/*
// @match                  *://www.amazon.fr/*
// @match                  *://www.amazon.in/*
// @match                  *://www.amazon.it/*
// @match                  *://www.amazon.nl/*
// @match                  *://www.amazon.pl/*
// @match                  *://www.amazon.sa/*
// @match                  *://www.amazon.se/*
// @match                  *://www.amazon.sg/*
// @match                  *://github.com/*/amazongpt*
// @exclude                *://*.amazon.*/ap/*
// @exclude                *://*.amazon.*/message-us*
// @include                https://auth0.openai.com
// @connect                am.aifree.site
// @connect                api.binjie.fun
// @connect                api.openai.com
// @connect                api11.gptforlove.com
// @connect                cdn.jsdelivr.net
// @connect                chat-share.kudoai.workers.dev
// @connect                chatai.mixerbox.com
// @connect                chatgpt.com
// @connect                chats.kudoai.com
// @connect                fanyi.sogou.com
// @connect                raw.githubusercontent.com
// @require                https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js@3.8.1/dist/chatgpt.min.js#sha256-/71AK4V0/J40zINYEriMeEWGIZ8qfyWMQu76ui3SBNs=
// @require                https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js#sha256-dppVXeVTurw1ozOPNE3XqhYmDJPOosfbKQcHyQSE58w=
// @require                https://cdn.jsdelivr.net/npm/json5@2.2.3/dist/index.min.js#sha256-S7ltnVPzgKyAGBlBG4wQhorJqYTehj5WQCrADCKJufE=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@88bcc7b/assets/js/components/chatbot/buttons.js#sha256-aZlxmH1b2UdwQrZ/1zZQbaTATtQ8yQKhWR4qd/utC3Y=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@0329ace/assets/js/components/chatbot/icons.js#sha256-p89CrELJj8rguE8M4IjdMA4CYwX7iid+RNzvX3oOT2A=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@31b78fe/assets/js/components/chatbot/menus.js#sha256-Bj0pz4oKLEzoaJxiqtddJ4E5VtMbpDB2sqoE4kDBfSs=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@97173cc/assets/js/components/chatbot/replyBubble.js#sha256-sOVj/ESmlNMLCA13w2ZzqP5hVtcnqlQpbY9yvkFWNek=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@f10be07/assets/js/components/chatbot/tooltip.js#sha256-u01988VokQnOZmjIIIPRN2mLJtaID/I8G77iMNcDOp8=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@bb5451a/assets/js/lib/chatbot/api.js#sha256-nCFc1tcSAfGJT260Sn07YGEczKPrhXdj8UlrKi+ac8M=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@ecaeb55/assets/js/lib/chatbot/feedback.js#sha256-9Hm3fBS96DtWFdT5VwGDGvwZMpYIRfxGAQRaCGECeqA=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@f4da9d4/assets/js/lib/chatbot/log.js#sha256-kjt26UXbx44I0/iDOf50F/LbRtsYcSwMHrexImR4D5A=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@199128d/assets/js/lib/chatbot/prompts.js#sha256-6U2C3dVLpYixR3UCNABCfvNpRa/9gJZYR8fElXmhGVk=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@9b048ff/assets/js/lib/chatbot/session.js#sha256-S6MOdBjx8Hci4GDvYl4JlhSdrDk2oaRLU9DrdxyiIss=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@3732152/assets/js/lib/chatbot/ui.js#sha256-j2G0yOX1nHMYmwhV9oLlycdX05oZHLxqCW4voSfbchQ=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@b1e28ff/assets/js/lib/chatbot/userscript.js#sha256-SytCWuD3YOcYFDaVfpF8Pq67zDbV8cZcIENz+0zpZ40=
// @require                https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@9b048ff/assets/js/lib/dom.js/dist/dom.min.js#sha256-IGNj9Eoecq7QgY7SAs75wONajgN9Wg0NmCjKTCfu9CY=
// @require                https://cdn.jsdelivr.net/npm/generate-ip@2.4.4/dist/generate-ip.min.js#sha256-aQQKAQcMgCu8IpJp9HKs387x0uYxngO+Fb4pc5nSF4I=
// @require                https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js#sha256-g3pvpbDHNrUrveKythkPMF2j/J7UFoHbUyFQcFe1yEY=
// @require                https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js#sha256-n0UwfFeU7SR6DQlfOmLlLvIhWmeyMnIDp/2RmVmuedE=
// @require                https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js#sha256-e1fUJ6xicGd9r42DgN7SzHMzb5FJoWe44f4NbvZmBK4=
// @require                https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js#sha256-Ffq85bZYmLMrA/XtJen4kacprUwNbYdxEKd0SqhHqJQ=
// @resource amzgptLSicon  https://cdn.jsdelivr.net/gh/KudoAI/amazongpt@0fddfc7/assets/images/icons/amazongpt/black-gold-teal/icon64.png.b64#sha256-0AAauajMY4eRCDUtqRMRqBl1gaxxF0mFt4eRnFGlU24=
// @resource amzgptDSicon  https://cdn.jsdelivr.net/gh/KudoAI/amazongpt@1ac5561/assets/images/icons/amazongpt/white/icon64.png.b64#sha256-qTQ5tnMF6XeH3UZkQOlJZvdE1nkn5/9srNKJqFtcCDo=
// @resource amzgptLSlogo  https://cdn.jsdelivr.net/gh/KudoAI/amazongpt@1ac5561/assets/images/logos/amazongpt/black-gold/logo509x74.png.b64#sha256-wSW1EtGtscP0ZcUweFBqKfswt3NzEjbKxn5COYyihVA=
// @resource amzgptDSlogo  https://cdn.jsdelivr.net/gh/KudoAI/amazongpt@1ac5561/assets/images/logos/amazongpt/white-teal/logo509x74.png.b64#sha256-EWstwtlU8+gXSM98gpr6OR3OZ63ttHVNp/NQ7IMzFDA=
// @resource hljsCSS       https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/railscasts.min.css#sha256-nMf0Oxaj3sYJiwGCsfqNpGnBbcofnzk+zz3xTxtdLEQ=
// @resource rpgCSS        https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@727feff/assets/styles/rising-particles/dist/gray.min.css#sha256-48sEWzNUGUOP04ur52G5VOfGZPSnZQfrF3szUr4VaRs=
// @resource rpwCSS        https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@727feff/assets/styles/rising-particles/dist/white.min.css#sha256-6xBXczm7yM1MZ/v0o1KVFfJGehHk47KJjq8oTktH4KE=
// @grant                  GM_getValue
// @grant                  GM_setValue
// @grant                  GM_deleteValue
// @grant                  GM_cookie
// @grant                  GM_registerMenuCommand
// @grant                  GM_unregisterMenuCommand
// @grant                  GM_getResourceText
// @grant                  GM_xmlhttpRequest
// @grant                  GM.xmlHttpRequest
// @noframes
// @downloadURL            https://raw.githubusercontent.com/KudoAI/amazongpt/main/greasemonkey/amazongpt.user.js
// @updateURL              https://raw.githubusercontent.com/KudoAI/amazongpt/main/greasemonkey/amazongpt.user.js
// @homepageURL            https://amazongpt.kudoai.com
// @supportURL             https://amazongpt.kudoai.com/issues
// @contributionURL        https://github.com/sponsors/KudoAI
// ==/UserScript==

// Dependencies:
// ✓ chatgpt.js (https://chatgpt.js.org) © 2023–2025 KudoAI & contributors under the MIT license
// ✓ generate-ip (https://generate-ip.org) © 2024–2025 Adam Lui & contributors under the MIT license
// ✓ highlight.js (https://highlightjs.org) © 2006 Ivan Sagalaev under the BSD 3-Clause license
// ✓ KaTeX (https://katex.org) © 2013–2020 Khan Academy & other contributors under the MIT license
// ✓ Marked (https://marked.js.org) © 2018+ MarkedJS © 2011–2018 Christopher Jeffrey under the MIT license

(async () => {

    // Init ENV context
    window.env = {
        browser: { language: chatgpt.getUserLanguage() },
        scriptManager: {
            name: (() => { try { return GM_info.scriptHandler } catch (err) { return 'unknown' }})(),
            version: (() => { try { return GM_info.version } catch (err) { return 'unknown' }})()
        }
    } ; ['Chromium', 'Firefox', 'Chrome', 'Edge', 'Brave', 'Mobile'].forEach(platform =>
        env.browser[`is${ platform == 'Firefox' ? 'FF' : platform }`] = chatgpt.browser['is' + platform]())
    env.browser.isPortrait = env.browser.isMobile && ( innerWidth < innerHeight )
    env.browser.isPhone = env.browser.isMobile && innerWidth <= 480
    env.scriptManager.supportsStreaming = /Tampermonkey|ScriptCat/.test(env.scriptManager.name)
    env.scriptManager.supportsTooltips = env.scriptManager.name == 'Tampermonkey'
                                      && parseInt(env.scriptManager.version.split('.')[0]) >= 5
    window.inputEvents = {} ; ['down', 'move', 'up'].forEach(action =>
        inputEvents[action] = ( window.PointerEvent ? 'pointer' : env.browser.isMobile ? 'touch' : 'mouse' ) + action)
    window.xhr = typeof GM != 'undefined' && GM.xmlHttpRequest || GM_xmlhttpRequest

    // Init APP data
    window.app = {
        version: GM_info.script.version, chatgptjsVer: /chatgpt\.js@([\d.]+)/.exec(GM_info.scriptMetaStr)[1],
        commitHashes: {
            app: 'd8c43db', // for cached <app|messages>.json
            aiweb: '2a51ece' // for cached <ai-chat-apis|code-languages|katex-delimiters|sogou-tts-lang-codes>.json
        }
    }
    app.urls = { resourceHost: `https://cdn.jsdelivr.net/gh/KudoAI/amazongpt@${app.commitHashes.app}` }
    const remoteData = {
        app: await new Promise(resolve => xhr({
            method: 'GET', url: `${app.urls.resourceHost}/assets/data/app.json`,
            onload: resp => resolve(JSON.parse(resp.responseText))
        })),
        msgs: await new Promise(resolve => {
            const msgHostDir = app.urls.resourceHost + '/greasemonkey/_locales/',
                  msgLocaleDir = ( env.browser.language ? env.browser.language.replace('-', '_') : 'en' ) + '/'
            let msgHref = msgHostDir + msgLocaleDir + 'messages.json', msgXHRtries = 0
            function fetchMsgs() { xhr({ method: 'GET', url: msgHref, onload: handleMsgs })}
            function handleMsgs(resp) {
                try { // to return localized messages.json
                    const msgs = JSON.parse(resp.responseText), flatMsgs = {}
                    for (const key in msgs)  // remove need to ref nested keys
                        if (typeof msgs[key] == 'object' && 'message' in msgs[key])
                            flatMsgs[key] = msgs[key].message
                    resolve(flatMsgs)
                } catch (err) { // if bad response
                    msgXHRtries++ ; if (msgXHRtries == 3) return resolve({}) // try original/region-stripped/EN only
                    msgHref = env.browser.language.includes('-') && msgXHRtries == 1 ? // if regional lang on 1st try...
                        msgHref.replace(/(_locales\/[^_]+)_[^_]+(\/)/, '$1$2') // ...strip region before retrying
                            : ( msgHostDir + 'en/messages.json' ) // else use default English messages
                    fetchMsgs()
                }
            }
            fetchMsgs()
        })
    }
    Object.assign(app, { ...remoteData.app, urls: { ...app.urls, ...remoteData.app.urls }, msgs: remoteData.msgs })
    app.urls.aiwebAssets = app.urls.aiwebAssets.replace('@latest', `@${app.commitHashes.aiweb}`)
    app.alerts = {
        waitingResponse:  `${app.msgs.alert_waitingFor} ${app.name} ${app.msgs.alert_response}...`,
        login:            `${app.msgs.alert_login} @ `,
        checkCloudflare:  `${app.msgs.alert_checkCloudflare} @ `,
        tooManyRequests:  `${app.msgs.alert_tooManyRequests}.`,
        parseFailed:      `${app.msgs.alert_parseFailed}.`,
        proxyNotWorking:  `${app.msgs.mode_proxy} ${app.msgs.alert_notWorking}.`,
        apiNotWorking:    `API ${app.msgs.alert_notWorking}.`,
        suggestProxy:     `${app.msgs.alert_try} ${app.msgs.alert_switchingOn} ${app.msgs.mode_proxy}`,
        suggestDiffAPI:   `${app.msgs.alert_try} ${app.msgs.alert_selectingDiff} API`,
        suggestOpenAI:    `${app.msgs.alert_try} ${app.msgs.alert_switchingOff} ${app.msgs.mode_proxy}`
    }
    app.katexDelimiters = await new Promise(resolve => xhr({ // used in show.reply()
        method: 'GET', onload: resp => resolve(JSON.parse(resp.responseText)),
        url: `${app.urls.aiwebAssets}/data/katex-delimiters.json`
    }))

    // Init API data
    window.apis = Object.assign(Object.create(null), await new Promise(resolve => xhr({
        method: 'GET', onload: resp => resolve(JSON5.parse(resp.responseText)),
        url: `${app.urls.aiwebAssets}/data/ai-chat-apis.json5`
    })))
    apis.AIchatOS.userID = '#/chat/' + Date.now()

    // Init SETTINGS
    window.config = {}
    window.settings = {
        load(...keys) {
            keys.flat().forEach(key => config[key] = GM_getValue(`${app.configKeyPrefix}_${key}`, initDefaultVal(key)))
            function initDefaultVal(key) {
                const ctrlData = settings.controls?.[key]
                return ctrlData?.defaultVal ?? ( ctrlData?.type == 'slider' ? 100 : ctrlData?.type == 'toggle' )
            }
        },
        save(key, val) { GM_setValue(`${app.configKeyPrefix}_${key}`, val) ; config[key] = val }
    }
    settings.load('debugMode') ; log.debug('Initializing settings...')
    Object.assign(settings, { controls: { // displays top-to-bottom, left-to-right in Settings modal
        proxyAPIenabled: { type: 'toggle', icon: 'sunglasses', defaultVal: false,
            label: app.msgs.menuLabel_proxyAPImode,
            helptip: app.msgs.helptip_proxyAPImode },
        preferredAPI: { type: 'modal', icon: 'lightning', defaultVal: false,
            label: `${app.msgs.menuLabel_preferred} API`,
            helptip: app.msgs.helptip_preferredAPI },
        streamingDisabled: { type: 'toggle', icon: 'signalStream', defaultVal: false,
            label: app.msgs.mode_streaming,
            helptip: app.msgs.helptip_streamingMode },
        autoFocusChatbarDisabled: { type: 'toggle', mobile: false, icon: 'caretsInward', defaultVal: true,
            label: app.msgs.menuLabel_autoFocusChatbar,
            helptip: app.msgs.helptip_autoFocusChatbar },
        autoScroll: { type: 'toggle', mobile: false, icon: 'arrowsDown', defaultVal: false,
            label: `${app.msgs.mode_autoScroll} (${app.msgs.menuLabel_whenStreaming})`,
            helptip: app.msgs.helptip_autoScroll },
        bgAnimationsDisabled: { type: 'toggle', icon: 'sparkles', defaultVal: false,
            label: `${app.msgs.menuLabel_background} ${app.msgs.menuLabel_animations}`,
            helptip: app.msgs.helptip_bgAnimations },
        fgAnimationsDisabled: { type: 'toggle', icon: 'sparkles', defaultVal: false,
            label: `${app.msgs.menuLabel_foreground} ${app.msgs.menuLabel_animations}`,
            helptip: app.msgs.helptip_fgAnimations },
        replyLang: { type: 'prompt', icon: 'languageChars',
            label: app.msgs.menuLabel_replyLanguage,
            helptip: app.msgs.helptip_replyLanguage },
        scheme: { type: 'modal', icon: 'scheme',
            label: app.msgs.menuLabel_colorScheme,
            helptip: app.msgs.helptip_colorScheme },
        debugMode: { type: 'toggle', icon: 'bug', defaultVal: false,
            label: app.msgs.mode_debug,
            helptip: app.msgs.helptip_debugMode },
        about: { type: 'modal', icon: 'questionMarkCircle',
            label: `${app.msgs.menuLabel_about} ${app.name}...` }
    }})
    Object.assign(config, { lineHeightRatio: 1.28, maxFontSize: 24, minFontSize: 11 })
    settings.load(Object.keys(settings.controls), 'expanded', 'fontSize', 'minimized')
    if (!config.replyLang) settings.save('replyLang', env.browser.language) // init reply language if unset
    if (!config.fontSize) settings.save('fontSize', 14) // init reply font size if unset
    if (!env.scriptManager.supportsStreaming) settings.save('streamingDisabled', true) // disable Streaming in unspported env
    log.debug(`Success! config = ${log.prettifyObj(config)}`)

    // Define UI functions

    const themes = {
        apply(theme) {
            if (!this.styleNode) document.head.append(this.styleNode = dom.create.style())
            this.styleNode.textContent = this.styles[theme]
        },

        selectors: {
            btn: {
                get after() { return this.shared.split(',').map(sel => `${sel}::after`).join(', ') },
                get before() { return this.shared.split(',').map(sel => `${sel}::before`).join(', ') },
                get hover() { return this.shared.split(',').map(sel => `${sel}:hover`).join(', ') },
                get hoverAfter() { return this.hover.split(',').map(sel => `${sel}::after`).join(', ') },
                get hoverBefore() { return this.hover.split(',').map(sel => `${sel}::before`).join(', ') },
                get hoverSVG() { return this.hover.split(',').map(sel => `${sel} svg`).join(', ') },
                modal: `body:has(#${app.slug}) .modal-buttons button`,
                modalPrimary: `body:has(#${app.slug}) .primary-modal-btn`,
                get shared() { return `${this.modal}` },
                get span() { return this.shared.split(',').map(sel => `${sel} span`).join(', ') },
                get svg() { return this.shared.split(',').map(sel => `${sel} svg`).join(', ') }
            }
        },

        styles: {
            get lines() { const { selectors } = themes ; return `

                /* General button styles */
                ${selectors.btn.shared} {
                  --content-color: ${ env.ui.app.scheme == 'light' ? '0,0,0' : '255,255,255' };
                  --side-line-fill: linear-gradient(rgb(var(--content-color)), rgb(var(--content-color))) ;
                  --skew: skew(-13deg) ; --counter-skew: skew(13deg) ; --btn-svg-zoom: scale(1.2) ;
                  --btn-transition: 0.1s ease all ;
                    position: relative ; border-width: 1px ; cursor: crosshair ;
                    border: 1px solid rgb(var(--content-color)) ;
                    background: /* side lines */
                        var(--side-line-fill) left / 2px 50% no-repeat,
                        var(--side-line-fill) right / 2px 50% no-repeat ;
                    background-position-y: 81% ;
                    background-color: #ffffff00 ; /* clear bg */
                    color: rgba(var(--content-color), ${ env.ui.app.scheme == 'light' ? 0.85 : 1 }) ;
                    font-size: 0.8em ; font-family: "Roboto", sans-serif ; text-transform: uppercase }
                ${selectors.btn.svg} {
                    stroke: rgba(var(--content-color), ${ env.ui.app.scheme == 'light' ? 0.65 : 1 }) ;
                    ${ config.fgAnimationsDisabled ? '' : `transition: var(--btn-transition) ;
                           -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                           -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition)` }}
                ${selectors.btn.span} { font-weight: 600 ; display: inline-block } /* text */
                ${selectors.btn.before}, ${selectors.btn.after} { /* top/bottom lines */
                    content: "" ; position: absolute ; background: rgb(var(--content-color)) ;
                    ${ config.fgAnimationsDisabled ? '' : `transition: var(--btn-transition) ;
                           -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                           -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition)` }}
                ${selectors.btn.before} { top: 0 ; left: 10% ; width: 65% ; height: 1px } /* top line */
                ${selectors.btn.after} { bottom: 0 ; right: 10% ; width: 80% ; height: 1px } /* bottom line */
                ${selectors.btn.hover} {
                    color: rgb(var(--content-color)) ;
                    background: /* extend side lines */
                        var(--side-line-fill) left / 2px 100% no-repeat,
                        var(--side-line-fill) right / 2px 100% no-repeat !important }
                ${selectors.btn.hoverBefore} { left: 0 ; width: 20px } /* top line on hover */
                ${selectors.btn.hoverAfter} { right: 0 ; width: 20px } /* bottom line on hover */
                ${selectors.btn.hoverSVG} { transform: var(--btn-svg-zoom) ; stroke: rgba(var(--content-color),1) }

                /* Modal styles */
                .${modals.class} { border-radius: 0 !important } /* square the corners to match the buttons */

                /* Modal button styles */
                ${selectors.btn.modal} {
                  --modal-btn-y-offset: 2px ; --glow-color: #a0fdff ;
                  --modal-btn-zoom: scale(1.075) ;
                  --modal-btn-transition: transform 0.1s ease, background 0.2s ease, box-shadow 5s ease ;
                    ${ config.fgAnimationsDisabled ? /* override chatgpt.js transitions */
                        `transition: none ;
                            -webkit-transition: none ; -moz-transition: none ;
                            -o-transition: none ; -ms-transition: none`
                      : `transition: var(--modal-btn-transition) ;
                            -webkit-transition: var(--modal-btn-transition) ;
                            -moz-transition: var(--modal-btn-transition) ;
                            -o-transition: var(--modal-btn-transition) ;
                            -ms-transition: var(--modal-btn-transition)` }}
                ${selectors.btn.modalPrimary} {
                    ${ env.ui.app.scheme == 'dark' ? 'background-color: white !important ; color: black'
                                                   : 'background-color: black !important ; color: white' }}
                ${selectors.btn.modal}:nth-child(odd) {
                    transform: translateY(calc(-1 * var(--modal-btn-y-offset))) }
                ${selectors.btn.modal}:nth-child(even) {
                    transform: translateY(var(--modal-btn-y-offset)) }
                ${selectors.btn.modal}:nth-child(odd):hover {
                    transform: translateY(calc(-1 * var(--modal-btn-y-offset))) ${
                        env.browser.isMobile ? '' : 'var(--modal-btn-zoom)' }}
                ${selectors.btn.modal}:nth-child(even):hover {
                    transform: translateY(var(--modal-btn-y-offset)) ${
                        env.browser.isMobile ? '' : 'var(--modal-btn-zoom)' }}
                ${selectors.btn.modal}:hover { /* add glow */
                    background-color: var(--glow-color) !important ;
                    box-shadow: 2px 1px 30px var(--glow-color) ;
                       -webkit-box-shadow: 2px 1px 30px var(--glow-color) ;
                       -moz-box-shadow: 2px 1px 30px var(--glow-color) }`
            }
        }
    }

    window.update = {

        replyPreMaxHeight() { // for various mode toggles
            const replyPre = app.div.querySelector('.reply-pre'),
                  longerPreHeight = innerHeight - 255
            if (replyPre) replyPre.style.maxHeight = `${ longerPreHeight - ( config.expanded ? 115 : 365 )}px`
        },

        appBottomPos() { app.div.style.bottom = `${ config.minimized ? 55 - app.div.offsetHeight : -7 }px` },

        appStyle() { // used in toggle.animations() + update.scheme() + main's app init
            const isParticlizedDS = env.ui.app.scheme == 'dark' && !config.bgAnimationsDisabled,
                  willNotZoom = config.fgAnimationsDisabled || env.browser.isMobile
            modals.stylize() // update modal styles
            if (!app.styles?.isConnected) document.head.append(app.styles ||= dom.create.style())
            app.styles.textContent = (

                // Init vars
               `:root {
                  --app-bg-color-light-scheme: white ; --app-bg-color-dark-scheme: #1c1c1c ;
                  --pre-bg-color-light-scheme: #b7b7b736 ; --pre-bg-color-dark-scheme: #3a3a3a ;
                  --reply-header-bg-color-light-scheme: #d7d4d4 ;
                  --reply-header-bg-color-dark-scheme: ${ !isParticlizedDS ? '#545454' : '#0e0e0e24' };
                  --reply-header-fg-color-light-scheme: white ; --reply-header-fg-color-dark-scheme: white ;
                  --chatbar-btn-hover-color-light-scheme: #638ed4 ; --chatbar-btn-hover-color-dark-scheme: white ;
                  --font-color-light-scheme: #4e4e4e ; --font-color-dark-scheme: #e3e3e3 ;
                  --app-border: ${ isParticlizedDS ? 'none'
                        : `1px solid #${ env.ui.app.scheme == 'light' ? 'dadce0' : '3b3b3b' }`};
                  --app-gradient-bg: linear-gradient(180deg, ${
                        env.ui.app.scheme == 'dark' ? '#99a8a6 -245px, black 185px' : '#b6ebff -163px, white 65px' }) ;
                  --app-anchored-shadow: 0 15px 52px rgb(0,0,${ env.ui.app.scheme == 'light' ? '7,0.06' : '11,0.22' }) ;
                  --app-transition: opacity 0.5s ease, transform 0.5s ease, /* for 1st fade-in */
                                    bottom 0.1s cubic-bezier(0,0,0.2,1), /* smoothen Anchor Y min/restore */
                                    width 0.167s cubic-bezier(0,0,0.2,1) ; /* smoothen Anchor X expand/shrink */
                  --btn-transition: transform 0.15s ease, /* for hover-zoom */
                                    opacity 0.25s ease-in-out ; /* + btn-zoom-fade-out + .app-hover-only shows */
                  --font-size-slider-thumb-transition: transform 0.05s ease ; /* for hover-zoom */
                  --reply-pre-transition: max-height 0.167s cubic-bezier(0, 0, 0.2, 1) ; /* for Anchor changes */
                  --fade-in-less-transition: opacity 0.2s ease } /* used by Font Size slider */`

                // Animations
             + `.fade-in { opacity: 0 ; transform: translateY(10px) }
                .fade-in-less { opacity: 0 ;
                    transition: var(--fade-in-less-transition) ;
                       -webkit-transition: var(--fade-in-less-transition) ;
                       -moz-transition: var(--fade-in-less-transition) ;
                       -o-transition: var(--fade-in-less-transition) ;
                       -ms-transition: var(--fade-in-less-transition) }
                .fade-in.active, .fade-in-less.active { opacity: 1 ; transform: translateY(0) }
                @keyframes btn-zoom-fade-out {
                    0% { opacity: 1 } 55% { opacity: 0.25 ; transform: scale(1.85) }
                    75% { opacity: 0.05 ; transform: scale(2.15) } 100% { opacity: 0 ; transform: scale(6.85) }}
                @keyframes icon-scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-14px) }}
                @keyframes pulse { 0%, to { opacity: 1 } 50% { opacity: .5 }}
                @keyframes rotate { from { transform: rotate(0deg) } to { transform: rotate(360deg) }}
                @keyframes spinY { 0% { transform: rotateY(0deg) } 100% { transform: rotateY(360deg) }}`

                // Main styles
             + `.no-user-select {
                   -webkit-user-select: none ; -moz-user-select: none ;
                   -ms-user-select: none ; user-select: none }
                .no-mobile-tap-outline { outline: none ; -webkit-tap-highlight-color: transparent }
                #${app.slug} * { scrollbar-width: thin } /* make scrollbars thin in Firefox */
                .cursor-overlay { /* for fontSizeSlider.createAppend() drag listeners to show resize cursor everywhere */
                    position: fixed ; top: 0 ; left: 0 ; width: 100% ; height: 100% ;
                    z-index: 9999 ; cursor: ew-resize }
                #${app.slug} { /* main app div */
                    color: var(--font-color-${env.ui.app.scheme}-scheme) ;
                    background: var(--app-bg-color-${env.ui.app.scheme}-scheme) ;
                    z-index: 5555 ; padding: 17px 26px 16px ; border-radius: 15px ;
                    word-wrap: break-word ; white-space: pre-wrap ;
                    transition: var(--app-transition) ;
                       -webkit-transition: var(--app-transition) ; -moz-transition: var(--app-transition) ;
                       -o-transition: var(--app-transition) ; -ms-transition: var(--app-transition) ;
                    ${ config.bgAnimationsDisabled ? `background: var(--app-bg-color-${env.ui.app.scheme}-scheme)`
                                                   : 'background-image: var(--app-gradient-bg)' }}
                #${app.slug} .app-hover-only { /* hide app-hover-only elems */
                    position: absolute ; left: -9999px ; opacity: 0 ; /* using position to support transitions */
                    width: 0 } /* to support width calcs */
                /* show app-hover-only elems on hover + Font Size button when slider visible */
                #${app.slug}:hover .app-hover-only, #${app.slug}:active .app-hover-only,
                    #${app.slug}:has([id$=font-size-slider-track].active) [id$=font-size-btn] {
                        position: relative ; left: auto ; width: auto ; opacity: 1 }
                #${app.slug} p { margin: 0 }
                #${app.slug} .alert-link {
                    color: ${ env.ui.app.scheme == 'light' ? '#190cb0' : 'white ; text-decoration: underline' }}
                .${app.slug}-name, .${app.slug}-name:hover {
                    font-size: 1.5rem ; font-weight: 700 ; text-decoration: none ;
                    color: ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' }}
                .byline { /* header byline */
                    position: relative ; bottom: -1px ; margin-left: 8px ; color: #aaa ;
                  --byline-transition: 0.15s ease-in-out ; transition: var(--byline-transition) ;
                       -webkit-transition: var(--byline-transition) ; -moz-transition: var(--byline-transition) ;
                       -o-transition: var(--byline-transition) ; -ms-transition: var(--byline-transition) }
                .byline a, .byline a:visited { color: #aaa ; text-decoration: none !important }
                .byline a:hover {
                    color: ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' };
                    transition: var(--byline-transition) ;
                       -webkit-transition: var(--byline-transition) ; -moz-transition: var(--byline-transition) ;
                       -o-transition: var(--byline-transition) ; -ms-transition: var(--byline-transition) }
                #${app.slug}-header-btns { display: flex ; direction: rtl ; gap: 2px ; float: right ; margin-top: -2px }
                .${app.slug}-header-btn {
                    float: right ; cursor: pointer ; position: relative ; top: 4px ;
                    ${ env.ui.app.scheme == 'dark' ? 'fill: white ; stroke: white'
                                                   : 'fill: #adadad ; stroke: #adadad' }}
                .${app.slug}-header-btn:hover svg { /* highlight/zoom header button on hover */
                    ${ env.ui.app.scheme == 'dark' ? 'fill: #d9d9d9 ; stroke: #d9d9d9'
                                                   : 'fill: black ; stroke: black' };
                    ${ env.browser.isMobile ? '' : 'transform: scale(1.285)' }}
                ${ config.fgAnimationsDisabled ? '' :
                   `.${app.slug}-header-btn, .${app.slug}-header-btn svg { /* smooth header button fade-in + hover-zoom */
                    transition: var(--btn-transition) ;
                       -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                       -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition) }`}
                .${app.slug}-header-btn:active {
                    ${ env.ui.app.scheme == 'dark' ? 'fill: #999999 ; stroke: #999999'
                                                   : 'fill: #638ed4 ; stroke: #638ed4' }}
                #${app.slug}-logo, .${app.slug}-header-btn svg {
                    filter: drop-shadow(${ env.ui.app.scheme == 'dark' ? '#7171714d 10px' : '#aaaaaa21 7px' } 7px 3px) }
                #${app.slug} .loading {
                    color: #b6b8ba ; fill: #b6b8ba ; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite }
                #${app.slug} section.loading { padding-left: 5px } /* left-pad loading status when sending replies */
                #${app.slug}-font-size-slider-track {
                    width: 98% ; height: 7px ; margin: -2px auto ${ env.browser.isPhone ? -8 : -13 }px ;
                    padding: 15px 0 ; background-color: #ccc ; box-sizing: content-box; background-clip: content-box ;
                   -webkit-background-clip: content-box }
                #${app.slug}-font-size-slider-track::before { /* to add finger cursor to unpadded core only */
                    content: "" ; position: absolute ; top: 10px ; left: 0 ; right: 0 ;
                    height: calc(100% - 20px) ; cursor: pointer }
                #${app.slug}-font-size-slider-tip {
                    z-index: 1 ; position: absolute ; bottom: 20px ;
                    border-left: 4.5px solid transparent ; border-right: 4.5px solid transparent ;
                    border-bottom: 16px solid #ccc }
                #${app.slug}-font-size-slider-thumb {
                    z-index: 2 ; width: 7px ; height: 25px ; border-radius: 30% ; position: relative ;
                    top: -7.65px ; cursor: ew-resize ;
                    background-color: ${ env.ui.app.scheme == 'dark' ? 'white' : '#4a4a4a' };
                  --shadow: rgba(0,0,0,0.21) 1px 1px 9px 0 ;
                        box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
                    ${ willNotZoom ? '' : `transition: var(--font-size-slider-thumb-transition) 
                           -webkit-transition: var(--font-size-slider-thumb-transition) ;
                           -moz-transition: var(--font-size-slider-thumb-transition) ;
                           -o-transition: var(--font-size-slider-thumb-transition) ;
                           -ms-transition: var(--font-size-slider-thumb-transition)` }}
                ${ env.browser.isMobile ? '' : `#${app.slug}-font-size-slider-thumb:hover { transform: scale(1.125) }`}`

              // AI reply elem styles
             + `#${app.slug} .reply-tip {
                    content: "" ; position: relative ; border: 7px solid transparent ;
                    float: left ; left: 7px ; margin: 3px -14px -23px -2px ; /* positioning */
                    border-bottom-style: solid ; border-bottom-width: 20px ; border-top: 0 ; border-bottom-color:
                        ${ // hide reply tip for terminal aesthetic
                            isParticlizedDS ? '#0000' : `var(--reply-header-bg-color-${env.ui.app.scheme}-scheme)` }}
                #${app.slug} .reply-header {
                    display: flex ; align-items: center ; position: relative ; width: 100% ;
                    top: 14px ; padding: 16px 14px ; height: 18px ; border-radius: 12px 12px 0 0 ;
                    ${ env.ui.app.scheme == 'light' ? 'border-bottom: 1px solid white'
                                  : isParticlizedDS ? 'border: 1px solid ; border-bottom-color: transparent' : '' };
                    background: var(--reply-header-bg-color-${env.ui.app.scheme}-scheme) ;
                    color:      var(--reply-header-fg-color-${env.ui.app.scheme}-scheme) ;
                    fill:       var(--reply-header-fg-color-${env.ui.app.scheme}-scheme) ;
                    stroke:     var(--reply-header-fg-color-${env.ui.app.scheme}-scheme) }
                #${app.slug} .reply-header-txt { flex-grow: 1 ; font-size: 12px ; font-family: monospace }
                #${app.slug} .reply-header-btns { margin: 7.5px -5px 0 }
                #${app.slug} .reply-pre {
                    font-size: ${config.fontSize}px ; white-space: pre-wrap ; min-width: 0 ;
                    line-height: ${ config.fontSize * config.lineHeightRatio }px ; overscroll-behavior: contain ;
                    position: relative ; z-index: 1 ; /* allow top-margin to overlap header in light scheme */
                    margin: ${ env.ui.app.scheme == 'light' ? 11 : 13 }px 0 7px 0 ; padding: 1.25em 1.25em 0 1.25em ;
                    border-radius: 0 0 12px 12px ; overflow: auto ;
                    ${ config.bgAnimationsDisabled ? // classic opaque bg
                        `background: var(--pre-bg-color-${env.ui.app.scheme}-scheme) ;
                         color: var(--font-color-${env.ui.app.scheme}-scheme)`
                    : env.ui.app.scheme == 'dark' ? // slightly tranluscent bg
                        'background: #2b3a40cf ; color: var(--font-color-dark-scheme) ; border: 1px solid white'
                    : /* light scheme */ `background: var(--pre-bg-color-light-scheme) ;
                         color: var(--font-color-light-scheme) ; border: none` };
                    ${ config.fgAnimationsDisabled ? '' : // smoothen Anchor mode expand/shrink
                        `transition: var(--reply-pre-transition) ;
                            -webkit-transition: var(--reply-pre-transition) ;
                            -moz-transition: var(--reply-pre-transition) ;
                            -o-transition: var(--reply-pre-transition) ;
                            -ms-transition: var(--reply-pre-transition)` }}
                #${app.slug} .reply-pre a, #${app.slug} .reply-pre a:visited { color: #4495d4 }
                #${app.slug} .reply-pre a:hover { color: ${ env.ui.app.scheme == 'dark' ? 'white' : '#ea7a28' }}
                #${app.slug} .code-header {
                    display: flex ; direction: rtl ; gap: 9px ; align-items: center ;
                    height: 11px ; margin: 3px -2px 0 }
                #${app.slug} .code-header btn { cursor: pointer }
                #${app.slug} .code-header svg { height: 13px ; width: 13px ; fill: white }`

              // Rendered markdown styles
             + `#${app.slug} .reply-pre h1 { font-size: 1.8em }
                #${app.slug} .reply-pre h2 { font-size: 1.65em }
                #${app.slug} .reply-pre h3 { font-size: 1.4em }
                #${app.slug} .reply-pre h1, #${app.slug} .reply-pre h2, #${app.slug} .reply-pre h3 {
                    margin-bottom: -15px } /* reduce gap after headings */
                #${app.slug} .reply-pre ol { /* override ol styles */
                    color: var(--font-color-${env.ui.app.scheme}-scheme) ; margin: -5px 0 -6px 7px }
                #${app.slug} .reply-pre ol > li { /* reduce v-padding, show number markers */
                    margin: -10px 0 -6px 1.6em ; list-style: decimal }
                #${app.slug} .reply-pre ol > li::marker { font-size: 0.9em } /* shrink number markers */
                #${app.slug} .reply-pre ul { /* override ul styles */
                    color: var(--font-color-${env.ui.app.scheme}-scheme) ; margin-bottom: -21px }
                #${app.slug} .reply-pre ul > li { list-style: circle } /* show hollow bullets */
                #${app.slug} .reply-pre ul ul > li { list-style: disc } /* fill sub-bullets */`

              // Rendered code styles
             + `#${app.slug} ${GM_getResourceText('hljsCSS') // color code
                    .replace(/\/\*[^*]+\*\//g, '') // strip comments
                    .trim().replace(/([,}])(.)(?![^{]*\})/g, `$1#${app.slug} $2`)} /* scope selectors to app */
                #${app.slug} pre:has(> code) { padding: 0 } /* remove padded border around code blocks */
                #${app.slug} code { font-size: 0.85em } /* shrink code vs. regular text */`

              // Rendered math styles
             + '.katex-html { display: none } /* hide unrendered math */'

              // Chatbar styles
             + `#${app.slug}-chatbar {
                    border: solid 1px ${ isParticlizedDS ? '#aaa' : env.ui.app.scheme == 'dark' ? '#777' : '#555' };
                    border-radius: 12px 13px 12px 0 ; margin: 3px 0 15px 0 ; padding: 13px 57px 9px 10px ;
                    font-size: 14.5px ; height: 46px ; width: 100% ; max-height: 200px ; resize: none ;
                    position: relative ; z-index: 555 ; color: #${ env.ui.app.scheme == 'dark' ? 'eee' : '222' };
                    background: ${ env.ui.app.scheme == 'light' ? '#eeeeee9e'
                        : `#515151${ config.bgAnimationsDisabled ? '' : '9e' }`};
                    ${ env.ui.app.scheme == 'dark' ? '' :
                        `--chatbar-inset-shadow: 0 1px 2px rgba(15,17,17,0.1) inset ;
                        box-shadow: var(--chatbar-inset-shadow) ; -webkit-box-shadow: var(--chatbar-inset-shadow) ;
                       -moz-box-shadow: var(--chatbar-inset-shadow) ;` }
                        transition: box-shadow 0.15s ease ;
                           -webkit-transition: box-shadow 0.15s ease ; -moz-transition: box-shadow 0.15s ease ;
                           -o-transition: box-shadow 0.15s ease ; -ms-transition: box-shadow 0.15s ease }
                ${ isParticlizedDS ? '' : // add inset shadow to chatbar on hover
                    `#${app.slug}-chatbar:hover:not(:focus) {
                      --chatbar-hover-inset-shadow: 0 ${
                            env.ui.app.scheme == 'dark' ? '3px 2px' : '1px 7px' } rgba(15,17,17,0.15) inset ;
                        box-shadow: var(--chatbar-hover-inset-shadow) ;
                       -webkit-box-shadow: var(--chatbar-hover-inset-shadow) ;
                       -moz-box-shadow: var(--chatbar-hover-inset-shadow) ;
                        transition: box-shadow 0.25s ease ;
                           -webkit-transition: box-shadow 0.25s ease ; -moz-transition: box-shadow 0.25s ease ;
                           -o-transition: box-shadow 0.25s ease ; -ms-transition: box-shadow 0.25s ease }`}
                #${app.slug}-chatbar:focus-visible { /* fallback outline chatbar + reduce inset shadow on focus */
                    outline: -webkit-focus-ring-color auto 1px ;
                    ${ isParticlizedDS ? '' :
                        `--inset-shadow: 0 ${
                                env.ui.app.scheme == 'dark' ? '3px -1px' : '1px 2px' } rgba(0,0,0,0.3) inset ;
                        box-shadow: var(--inset-shadow) ; -webkit-box-shadow: var(--inset-shadow) ;
                       -moz-box-shadow: var(--inset-shadow)`}}
                .${app.slug}-chatbar-btn {
                    z-index: 560 ; border: none ; float: right ; position: relative ;
                    bottom: 50px ; background: none ; cursor: pointer ;
                    ${ env.ui.app.scheme == 'dark' ? 'color: #aaa ; fill: #aaa ; stroke: #aaa'
                                                    : 'color: lightgrey ; fill: lightgrey ; stroke: lightgrey' }}
                .${app.slug}-chatbar-btn:hover {
                    color:  var(--chatbar-btn-hover-color-${env.ui.app.scheme}-scheme) ;
                    fill:   var(--chatbar-btn-hover-color-${env.ui.app.scheme}-scheme) ;
                    stroke: var(--chatbar-btn-hover-color-${env.ui.app.scheme}-scheme) }`

              // Footer styles
             + `#${app.slug} + footer { margin: 2px 0 25px ; position: relative }
                #${app.slug} + footer * { color: ${ env.ui.app.scheme == 'dark' ? '#ccc' : '#666' } !important }`

              // Notif styles
             + `.chatgpt-notif {
                    font-size: 26px !important ; fill: white ; stroke: white ; color: white ;
                    padding: 9px 14px 18px 11.5px !important }
                .notif-close-btn { display: none !important }` /* hide notif close btn */

              // Menu styles
             + `.${app.slug}-menu {
                    position: absolute ; z-index: 2250 ;
                    padding: 3.5px 5px !important ; font-family: "Source Sans Pro", sans-serif ; font-size: 12px }
                .${app.slug}-menu ul { margin: 0 ; padding: 0 ; list-style: none }
                .${app.slug}-menu-item { padding: 0 5px ; line-height: 20.5px }
                .${app.slug}-menu-item:not(.${app.slug}-menu-header):hover {
                    cursor: pointer ; background: white ; color: black ; fill: black }`

              // Anchor Mode styles
             + `#${app.slug}.anchored {
                    position: fixed ; bottom: -7px ; right: 35px ; z-index: 8888 ;
                    border: var(--app-border) ; box-shadow: var(--app-anchored-shadow) ;
                    right: ${ env.browser.isMobile ? innerWidth *0.01 : 35 }px ;
                    width: ${ env.browser.isMobile ? '98%' : '441px' }}
                #${app.slug}.expanded { width: 528px }
                #${app.slug}.anchored .anchored-hidden { display: none } /* hide non-Anchor elems in mode */
                #${app.slug}:not(.anchored) .anchored-only { display: none } /* hide Anchor elems outside mode */`

              // Touch device styles
             + `@media (hover: none) {
                    #${app.slug} .app-hover-only { /* show app-hover-only elems */
                        position: relative ; left: auto ; width: auto ; opacity: 1 }
                }`

              // Phone styles
             + `@media screen and (max-width: 480px) {
                    #${app.slug} #${app.slug}-logo { width: calc(100% - 118px) } /* widen logo till btns */
                    #${app.slug} .byline { display: none !important } /* hide byline */
                    #${app.slug} .reply-tip { display: none } /* hide reply tip */
                }`
            )
            themes.apply(config.theme)
        },

        bylineVisibility() {
            if (env.browser.isPhone) return // since byline hidden by app.styles

            // Init header elems
            const headerElems = { byline: app.div.querySelector('.byline') }
            if (!headerElems.byline) return // since in loading state
            Object.assign(headerElems, {
                btns: app.div.querySelectorAll(`#${app.slug}-header-btns > btn`),
                logo: app.div.querySelector(`#${app.slug}-logo`)
            })

            // Calc/store widths of app/x-padding + header elems
            const appDivStyle = getComputedStyle(app.div)
            const widths = {
                appDiv: app.div.getBoundingClientRect().width,
                appDivXpadding: parseFloat(appDivStyle.paddingLeft) + parseFloat(appDivStyle.paddingRight)
            }
            Object.entries(headerElems).forEach(([key, elem]) => widths[key] = dom.get.computedWidth(elem))

            // Hide/show byline based on space available
            const availSpace = widths.appDiv - widths.appDivXpadding - widths.logo - widths.btns -10
            Object.assign(headerElems.byline.style, widths.byline > availSpace ?
                { position: 'absolute', left: '-9999px', opacity: 0 } // hide using position to support transition
              : { position: '', left: '', opacity: 1 } // show
            )
        },

        replyPrefix() {
            const firstP = app.div.querySelector('pre p')
            if (!firstP) return
            const prefixNeeded = env.ui.app.scheme == 'dark'
                && !config.bgAnimationsDisabled && !/shuffle|summarize/.test(get.reply.src)
            const prefixExists = firstP.textContent.startsWith('>> ')
            if (prefixNeeded && !prefixExists) firstP.prepend('>> ')
            else if (!prefixNeeded && prefixExists) firstP.textContent = firstP.textContent.replace(/^>> /, '')
        },

        risingParticles() {
            ['sm', 'med', 'lg'].forEach(size =>
                document.querySelectorAll(`[id*=particles-${size}]`).forEach(particlesDiv =>
                    particlesDiv.id = config.bgAnimationsDisabled ? `particles-${size}-off`
                    : `${ env.ui.app.scheme == 'dark' ? 'white' : 'gray' }-particles-${size}`
            ))
        },

        scheme(newScheme) {
            env.ui.app.scheme = newScheme ; logos.amazongpt.update() ; icons.app.amazongpt.update() ; update.appStyle()
            update.risingParticles() ; update.replyPrefix() ; modals.settings.updateSchemeStatus()
        }
    }

    // Define TOGGLE functions

    window.toggle = {

        animations(layer) {
            const configKey = `${layer}AnimationsDisabled`
            settings.save(configKey, !config[configKey])
            update.appStyle() ; if (layer == 'bg') { update.risingParticles() ; update.replyPrefix() }
            if (layer == 'fg' && modals.settings.get()) { // toggle ticker-scroll of About status label
                const aboutStatusLabel = document.querySelector('#about-settings-entry > span > div')
                aboutStatusLabel.innerHTML = modals.settings.aboutContent[
                    config.fgAnimationsDisabled ? 'short' : 'long']
                aboutStatusLabel.style.float = config.fgAnimationsDisabled ? 'right' : ''
            }
            feedback.notify(`${settings.controls[configKey].label} ${menus.toolbar.state.words[+!config[configKey]]}`)
        },

        expandedMode(state = '') {
            const toExpand = state == 'on' || !state && !config.expanded
            settings.save('expanded', toExpand) ; app.div.classList.toggle('expanded', toExpand)
            if (getComputedStyle(app.div).transitionProperty.includes('width')) // update byline visibility
                app.div.addEventListener('transitionend', function onTransitionEnd(event) { // ...after width transition
                    if (event.propertyName == 'width') {
                        update.bylineVisibility() ; app.div.removeEventListener('transitionend', onTransitionEnd)
            }})
            if (config.minimized) toggle.minimized('off') // since user wants to see stuff
            const expandBtn = app.div.querySelector(`#${app.slug}-arrows-btn`)
            if (expandBtn) expandBtn.firstChild.replaceWith(
                icons.create({ key: `arrowsDiagonal${ config.expanded ? 'In' : 'Out' }`, size: 17 }))
        },

        minimized(state = '') {
            const toMinimize = state == 'on' || !state && !config.minimized
            settings.save('minimized', toMinimize)
            const chevronBtn = app.div.querySelector('[id$=chevron-btn]')
            if (chevronBtn) { // update icon
                chevronBtn.textContent = ''
                chevronBtn.append(icons.create({ key: `chevron${ config.minimized ? 'Up' : 'Down' }`,
                    size: 22, style: 'position: relative ; top: -1px' }))
                chevronBtn.onclick = () => {
                    if (app.div.querySelector('[id$=font-size-slider-track]')?.classList.contains('active'))
                        fontSizeSlider.toggle('off')
                    toggle.minimized()
                }
            }
            update.appBottomPos() // toggle visual minimization
            tooltip.toggle('off') // hide lingering tooltip
        },

        proxyMode() {
            settings.save('proxyAPIenabled', !config.proxyAPIenabled)
            feedback.notify(`${app.msgs.menuLabel_proxyAPImode} ${menus.toolbar.state.words[+config.proxyAPIenabled]}`)
            menus.toolbar.refresh()
            if (modals.settings.get()) { // update visual states of Settings toggles
                const proxyToggle = document.querySelector('[id*=proxy] input'),
                      preferredAPIentry = document.querySelector('[id*=preferredAPI]'),
                      streamingToggle = document.querySelector('[id*=streaming] input')
                if (proxyToggle.checked != config.proxyAPIenabled) // Proxy state out-of-sync (from using toolbar menu)
                    modals.settings.toggle.switch(proxyToggle)
                preferredAPIentry.classList.toggle('active', config.proxyAPIenabled)
                preferredAPIentry.style.pointerEvents = config.proxyAPIenabled ? '' : 'none'
                if (streamingToggle.checked && !config.proxyAPIenabled // Streaming checked but OpenAI mode
                    || // ...or Streaming unchecked but enabled in Proxy mode
                        !streamingToggle.checked && config.proxyAPIenabled && !config.streamingDisabled)
                            modals.settings.toggle.switch(streamingToggle)
            }
            const apiBeacon = app.div.querySelector(`#${app.slug} .api-btn`)
            if (apiBeacon) apiBeacon.style.pointerEvents = config.proxyAPIenabled ? '' : 'none'
            if (app.div.querySelector(`.${app.slug}-alert`)) // re-send query if user alerted
                get.reply({ msgs: app.msgChain, src: get.reply.src })
        },

        streaming() {
            if (!env.scriptManager.supportsStreaming) { // alert userscript manager unsupported, suggest TM/SC
                const scLink = (
                    env.browser.isFF ?
                        'https://addons.mozilla.org/firefox/addon/scriptcat/'
                  : env.browser.isEdge ?
                        'https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh'
                      : 'https://chromewebstore.google.com/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf' )
                modals.alert(
                    `${settings.controls.streamingDisabled.label} ${app.msgs.alert_unavailable}`,
                    `${settings.controls.streamingDisabled.label} ${app.msgs.alert_isOnlyAvailFor}`
                        + ` <a target="_blank" rel="noopener" href="https://tampermonkey.net">Tampermonkey</a> ${
                                app.msgs.about_and}`
                        + ` <a target="_blank" rel="noopener" href="${scLink}">ScriptCat</a>.`
                        + ` (${app.msgs.alert_userscriptMgrNoStream}.)`
                )
            } else if (!config.proxyAPIenabled) { // alert OpenAI API unsupported, suggest Proxy Mode
                let msg = `${settings.controls.streamingDisabled.label} `
                        + `${app.msgs.alert_isCurrentlyOnlyAvailBy} `
                        + `${app.msgs.alert_switchingOn} ${app.msgs.mode_proxy}. `
                        + `(${app.msgs.alert_openAIsupportSoon}!)`
                const switchPhrase = app.msgs.alert_switchingOn
                msg = msg.replace(switchPhrase, `<a class="alert-link" href="#">${switchPhrase}</a>`)
                const alert = modals.alert(`${app.msgs.mode_streaming} ${app.msgs.alert_unavailable}`, msg)
                alert.querySelector('[href="#"]').onclick = () => {
                    alert.querySelector('.modal-close-btn').click() ; toggle.proxyMode() }
            } else { // functional toggle
                settings.save('streamingDisabled', !config.streamingDisabled)
                feedback.notify(`${settings.controls.streamingDisabled.label} ${
                          menus.toolbar.state.words[+!config.streamingDisabled]}`)
            }
        }
    }

    // Define GET functions

    window.get = {

        json(url) {
            return new Promise((resolve, reject) => {
                let retryCnt = 0;
                (function getData(url) { xhr({
                    method: 'GET', url: url, onload: resp => {
                        if (resp.status == 404 && retryCnt < 1) { // try other format
                            retryCnt++ ; getData(url.endsWith('.json') ? url + '5' : url.slice(0, -1))
                        } else handleResp(resp, resolve, reject)
                    },
                    onerror: err => reject(new Error(`LOAD ERROR: ${err.message}`))
                })})(url)

                function handleResp(resp, resolve, reject) {
                    if (resp.status >= 300) { // status error
                        const errType = resp.status >= 300 && resp.status < 400 ? 'REDIRECT'
                                      : resp.status >= 400 && resp.status < 500 ? 'CLIENT' : 'SERVER'
                        return reject(new Error(`${errType} ERROR: ${resp.status}`))
                    }
                    try { resolve(JSON5.parse(resp.responseText)) }
                    catch (err) { reject(new Error(`PARSE ERROR: ${err.message}`)) }
                }
            })
        },

        async reply({ msgs, src = null }) {
            get.reply.src = src ; show.reply.updatedAPIinHeader = false

            // Show loading status
            const loadingSpinner = icons.create({ key: 'arrowsCyclic', size: 15 }) ; let loadingElem
            loadingSpinner.style.cssText = 'position: relative ; top: 2px ; margin-right: 6px'
            if (app.div.querySelector('.reply-pre')) { // reply exists, show where chatbar was
                loadingElem = app.div.querySelector('section')
                loadingElem.textContent = app.alerts.waitingResponse
                loadingSpinner.style.animation = 'rotate 1s infinite cubic-bezier(0, 1.05, 0.79, 0.44)' // faster ver
            } else { // replace app div w/ alert
                feedback.appAlert('waitingResponse')
                loadingElem = app.div.querySelector(`.${app.slug}-alert`)
                loadingSpinner.style.animation = 'rotate 2s infinite linear' // slower ver
            }
            loadingElem.classList.add('loading', 'no-user-select')
            loadingElem.prepend(loadingSpinner)

            // Init msgs
            msgs = structuredClone(msgs) // deep copy to not affect app.msgChain
            if (msgs.length > 3) msgs = msgs.slice(-3) // keep last 3 only
            msgs.forEach(msg => { // trim agent msgs
                if (msg.role == 'assistant' && msg.content.length > 250)
                    msg.content = msg.content.substring(0, 250) + '...' })

            // Init API attempt props
            get.reply.status = 'waiting'
            get.reply.triedAPIs = get.reply.triedAPIs || []
            get.reply.attemptCnt = get.reply.attemptCnt || 1

            // Pick API
            get.reply.api = config.proxyAPIenabled ? api.pick(get.reply) : 'OpenAI'
            if (!get.reply.api) // no more proxy APIs left untried
                return feedback.appAlert(`${ config.preferredAPI ? 'api' : 'proxy' }NotWorking`,
                    `suggest${ config.preferredAPI ? 'DiffAPI' : 'OpenAI' }`)

            // Init OpenAI key
            if (!config.proxyAPIenabled)
                config.openAIkey = await Promise.race(
                    [session.getOAItoken(), new Promise(reject => setTimeout(reject, 3000))])

            // Try diff API after 7-14s of no response
            else {
                const iniAPI = get.reply.api ; clearTimeout(get.reply.timeout)
                get.reply.timeout = setTimeout(() => {
                    if (config.proxyAPIenabled // only do in Proxy mode
                        && get.reply.status != 'done' && !get.reply.sender // still no reply received
                        && get.reply.api == iniAPI // not already trying diff API from err
                        && get.reply.triedAPIs.length != Object.keys(apis).length -1 // untried APIs remain
                    ) api.tryNew(get.reply, 'timeout')
                }, ( config.streamingDisabled ? 10 : 7 *( config.preferredAPI ? 2 : 1 )) *1000)
            }

            // Augment query
            const reqAPI = get.reply.api, lastUserMsg = msgs[msgs.length - 1]
            lastUserMsg.content = prompts.augment(lastUserMsg.content, { api: reqAPI, caller: get.reply })

            // Get/show answer from AI
            const reqMethod = apis[reqAPI].method
            const reqData = api.createReqData(reqAPI, msgs)
            const xhrConfig = {
                headers: api.createHeaders(reqAPI), method: reqMethod,
                responseType: config.streamingDisabled || !config.proxyAPIenabled ? 'text' : 'stream',
                onerror: err => { log.error(err)
                    if (!config.proxyAPIenabled)
                        feedback.appAlert(!config.openAIkey ? 'login' : ['OpenAI', 'notWorking', 'suggestProxy'])
                    else api.tryNew(get.reply)
                },
                onload: resp => api.process.text(resp, { caller: get.reply, callerAPI: reqAPI }),
                onloadstart: resp => api.process.stream(resp, { caller: get.reply, callerAPI: reqAPI }),
                url: apis[reqAPI].endpoints?.completions || apis[reqAPI].endpoint
            }
            if (reqMethod == 'POST') xhrConfig.data = JSON.stringify(reqData)
            else if (reqMethod == 'GET') xhrConfig.url += `?q=${reqData}`
            xhr(xhrConfig)
        }
    }

    // Define SHOW functions

    window.show = {

        async codeCornerBtns() {
            if (!app.div.querySelector('code')) return

            // Init general language data
            window.codeLangData ||= await get.json(`${app.urls.aiwebAssets}/data/code-languages.json`)
                .catch(err => log.error(err.message))

            // Add buttons to every block
            app.div.querySelectorAll('code').forEach(block => {
                if (block.querySelector('[id$=copy-btn]')) return
                const codeBtnsDiv = dom.create.elem('div', { class: `code-header` })

                // Create Copy button
                const copyBtn = buttons.reply.bubble.copy.cloneNode(true)
                copyBtn.style.cssText = '' // clear app header btn styles
                Object.entries(buttons.reply.bubble.copy.listeners).forEach(
                    ([eventType, handler]) => copyBtn[eventType] = handler)

                // Create Download button
                const downloadBtn = dom.create.elem('btn', { id: `${app.slug}-download-btn` })
                const downloadSVGs = {
                    download: icons.create({ key: 'download' }), downloaded: icons.create({ key: 'checkmarkDouble' })}
                Object.entries(downloadSVGs).forEach(([svgType, svg]) => {
                    svg.id = `${app.slug}-${svgType}-icon`
                    ;['width', 'height'].forEach(attr => svg.setAttribute(attr, 15))
                })
                downloadBtn.append(downloadSVGs.download)
                downloadBtn.onclick = event => { // download code, update icon + tooltip status
                    if (!downloadBtn.firstChild.matches('[id$=download-icon]')) return // since clicking on DL'd icon

                    // Update cursor/icon/tooltip
                    downloadBtn.style.cursor = 'default' // remove finger
                    downloadBtn.firstChild.replaceWith(downloadSVGs.downloaded.cloneNode(true)) // change to DL'd icon
                    tooltip.update(event.currentTarget) // to 'Code downloaded!'
                    setTimeout(() => { // restore icon/cursor/tooltip after a bit
                        downloadBtn.firstChild.replaceWith(downloadSVGs.download.cloneNode(true))
                        downloadBtn.style.cursor = 'pointer'
                        if (downloadBtn.matches(':hover')) // restore tooltip
                            downloadBtn.dispatchEvent(new Event('mouseenter'))
                    }, 10000)

                    // Init block's language data
                    const codeBlock = downloadBtn.closest('code'),
                          blockLang = { hljsSlug: /language-(\w+)/.exec(codeBlock.className)?.[1] }
                    if (blockLang.hljsSlug && window.codeLangData)
                        for (const [langName, langEntry] of Object.entries(window.codeLangData))
                            if (langEntry.hljsSlug == blockLang.hljsSlug) {
                                [blockLang.name, blockLang.fileExtension] = [langName, langEntry.fileExtension]
                                break
                            }

                    // Download code
                    const code = codeBlock.textContent.replace(/^>> /, '').trim() + '\n'
                    const dlLink = dom.create.anchor(URL.createObjectURL(new Blob([code], { type: 'text/plain' })))
                    const now = new Date(), formattedDate = [ // YYYY-MM-DD
                        now.getFullYear(),
                        String(now.getMonth() +1).padStart(2, '0'),
                        String(now.getDate()).padStart(2, '0')
                    ].join('-')
                    dlLink.download /* filename */ = `${app.slug}_${blockLang.name.toLowerCase() || 'code'}_${
                        formattedDate}_${Date.now().toString(36)}${
                        blockLang.fileExtension ? '.' + blockLang.fileExtension : '' }`
                    document.body.append(dlLink) ; dlLink.click() ; dlLink.remove() // download code
                    URL.revokeObjectURL(dlLink.href) // prevent memory leaks
                }
                downloadBtn.onmouseenter = downloadBtn.onmouseleave = tooltip.toggle

                // Assemble elems
                codeBtnsDiv.append(copyBtn, downloadBtn) ; block.prepend(codeBtnsDiv)
            })
        },

        reply({ content, apiUsed = null }) {
            show.reply.shareURL = null // reset to regen using longer app.msgChain
            tooltip.toggle('off') // hide lingering tooltip if cursor was on corner button
            const regenSVGwrapper = app.div.querySelector('[id$=regen-btn]')?.firstChild
            if (regenSVGwrapper?.style?.animation || regenSVGwrapper?.style?.transform) {
                Object.assign(regenSVGwrapper.style, { animation: '', transform: '', cursor: '' }) // rm animation/tilt
                const regenBtn = regenSVGwrapper.closest('btn')
                if (regenBtn.matches(':hover')) // restore tooltip
                    regenBtn.dispatchEvent(new Event('mouseenter')) // + tooltip
            }

            // Build answer interface up to reply section if missing
            if (!app.div.querySelector('.reply-pre')) {
                app.div.textContent = '' ; dom.addRisingParticles(app.div)

                // Create/append header div
                const appHeaderDiv = dom.create.elem('div', { class: 'app-header', style: 'margin: -3px 0' })
                app.div.append(appHeaderDiv)

                // Create/append title
                const appHeaderLogo = logos.amazongpt.create()
                appHeaderLogo.style.width = env.browser.isMobile ? '55%' : '181px'
                const appTitleAnchor = dom.create.anchor(app.urls.app, appHeaderLogo)
                appTitleAnchor.classList.add(`${app.slug}-name`, 'no-user-select')
                appHeaderDiv.append(appTitleAnchor)

                // Create/append header buttons div
                const headerBtnsDiv = dom.create.elem('div', {
                    id: `${app.slug}-header-btns`, class: 'no-mobile-tap-outline' })
                appHeaderDiv.append(headerBtnsDiv)

                // Create/append Chevron button
                const chevronBtn = dom.create.elem('btn', {
                    id: `${app.slug}-chevron-btn`, class: `${app.slug}-header-btn anchored-only`,
                    style: 'margin: -1.5px 1px 0 11px' })
                chevronBtn.append(icons.create({ key: `chevron${ config.minimized ? 'Up' : 'Down' }`,
                    size: 22, style: 'position: relative ; top: -1px' }))
                headerBtnsDiv.append(chevronBtn)

                // Create/append About button
                const aboutBtn = dom.create.elem('btn', {
                    id: `${app.slug}-about-btn`, class: `${app.slug}-header-btn` })
                aboutBtn.append(icons.create({ key: 'questionMarkCircle' })) ; headerBtnsDiv.append(aboutBtn)

                // Create/append Settings button
                const settingsBtn = dom.create.elem('btn', {
                    id: `${app.slug}-settings-btn`, class: `${app.slug}-header-btn`,
                    style: 'margin: 2px 10.5px 0 3px' })
                settingsBtn.append(icons.create({ key: 'sliders', size: 17 })) ; headerBtnsDiv.append(settingsBtn)

                // Create/append Font Size button
                const fontSizeBtn = dom.create.elem('btn', {
                    id: `${app.slug}-font-size-btn`, class: `${app.slug}-header-btn app-hover-only`,
                    style: 'margin-right: 10px' })
                fontSizeBtn.append(icons.create({ key: 'fontSize' })) ; headerBtnsDiv.append(fontSizeBtn)

                if (!env.browser.isMobile) {

                // Create/append Expand/Shrink button
                    var arrowsBtn = dom.create.elem('btn', {
                        id: `${app.slug}-arrows-btn`, class: `${app.slug}-header-btn app-hover-only anchored-only`,
                        style: 'margin: 1.5px 13.5px 0 0' })
                    arrowsBtn.append(icons.create({
                        key: `arrowsDiagonal${ config.expanded ? 'In' : 'Out' }`, size: 17 }))
                    headerBtnsDiv.append(arrowsBtn)
                }

                // Add app header button listeners
                ui.addListeners.btns.appHeader()

                // Create/append 'by KudoAI'
                const bylineSpan = dom.create.elem('span', { class: 'byline no-user-select' })
                bylineSpan.textContent = 'by '
                bylineSpan.append(dom.create.anchor(app.urls.publisher, 'KudoAI'))
                appHeaderDiv.querySelector(`.${app.slug}-name`).insertAdjacentElement('afterend', bylineSpan)
                update.bylineVisibility()

                // Create/append answer bubble
                replyBubble.insert()
            }

            // Build reply section if missing
            if (!app.div.querySelector(`#${app.slug}-chatbar`)) {

                // Init/clear user reply section content/classes/style
                const replySection = app.div.querySelector('section') || dom.create.elem('section')
                if (replySection.className.includes('loading'))
                    replySection.textContent = replySection.className = replySection.style = ''

                // Create/append section elems
                const replyForm = dom.create.elem('form')
                const continueChatDiv = dom.create.elem('div')
                const chatTextarea = dom.create.elem('textarea', {
                    id: `${app.slug}-chatbar`, rows: 1, placeholder: `${app.msgs.tooltip_sendReply}...` })
                continueChatDiv.append(chatTextarea)
                replyForm.append(continueChatDiv) ; replySection.append(replyForm)
                app.div.querySelector('.reply-bubble').after(replySection)

                // Create/append chatbar buttons
                ;['send', 'shuffle'].forEach(btnType => {
                    const btn = dom.create.elem('button', {
                        id: `${app.slug}-${btnType}-btn`, class: `${app.slug}-chatbar-btn no-mobile-tap-outline` })
                    btn.style.right = `${ btnType == 'send' ? ( env.browser.isFF ? 12 : 9 )
                                                            : ( env.browser.isFF ? 13 : 7 )}px` // Shuffle btn
                    btn.append(icons.create({ key: btnType, size: btnType == 'send' ? 14 : 18 }))
                    continueChatDiv.append(btn)
                })

                // Add listeners
                ui.addListeners.replySection()

                // Scroll to top on mobile if user interacted
                if (env.browser.isMobile && show.reply.userInteracted) {
                    document.body.scrollTop = 0 // Safari
                    document.documentElement.scrollTop = 0 // Chromium/FF/IE
                }
            }

            // Show API used in bubble header
            if (!show.reply.updatedAPIinHeader) {
                show.reply.updatedAPIinHeader = true
                const preHeaderLabel = app.div.querySelector('.reply-header-txt'),
                      apiBeacon = dom.create.elem('span', { class: 'api-btn', style: 'cursor: pointer' })
                apiBeacon.textContent = '⦿'
                apiBeacon.onmouseenter = apiBeacon.onmouseleave = apiBeacon.onclick = menus.hover.toggle
                apiBeacon.style.pointerEvents = config.proxyAPIenabled ? '' : 'none'
                preHeaderLabel.replaceChildren(
                    apiBeacon, ` API ${app.msgs.componentLabel_used}: `, dom.create.elem('b'))
                setTimeout(() => type(apiUsed, preHeaderLabel.lastChild, { speed: 1.5 }), 150)
                function type(text, targetElem, { speed = 1 } = {}) {
                    targetElem.textContent = '' ; let i = 0;
                    (function typeNextChar() {
                        if (i < text.length) {
                            targetElem.textContent += text[i] ; i++ ; setTimeout(typeNextChar, 50 / speed) }
                    })()
                }
            }

            // Render MD, highlight code
            const replyPre = app.div.querySelector('.reply-pre')
            try { // to render markdown
                replyPre.innerHTML = marked.parse(content) } catch (err) { log.error(err.message) }
            hljs.highlightAll() // highlight code
            replyPre.querySelectorAll('code').forEach(codeBlock => // add linebreaks after semicolons
                codeBlock.innerHTML = codeBlock.innerHTML.replace(/;\s*/g, ';<br>'))
            update.replyPrefix() // prepend '>> ' if dark scheme w/ bg animations to emulate terminal

            // Typeset math
            ;[replyPre, ...replyPre.querySelectorAll('*')].forEach(elem =>
                renderMathInElement(elem, { delimiters: app.katexDelimiters, throwOnError: false }))

            // Auto-scroll if active
            if (config.autoScroll && !env.browser.isMobile && config.proxyAPIenabled && !config.streamingDisabled)
                replyPre.scrollTop = replyPre.scrollHeight

            // Focus chatbar conditionally
            if (!show.reply.chatbarFocused // do only once
                && !env.browser.isMobile // exclude mobile devices to not auto-popup OSD keyboard
                && (!config.autoFocusChatbarDisabled // AF enabled
                    || (  // ...or AF disabled & user interacted
                        config.autoFocusChatbarDisabled && show.reply.userInteracted))
            ) { app.div.querySelector(`#${app.slug}-chatbar`).focus() ; show.reply.chatbarFocused = true }

            // Update styles
            update.appBottomPos() // restore minimized/restored state

            show.reply.userInteracted = false
        }
    }

    // Define COMPONENTS

    window.fontSizeSlider = { // requires dom.js + <app|config|inputEvents>
        fadeInDelay: 5, // ms
        hWheelDistance: 10, // px

        createAppend() { // requires dom.js + <app|config|inputEvents>

            // Create/ID/classify slider elems
            fontSizeSlider.cursorOverlay = dom.create.elem('div', { class: 'cursor-overlay' })
            const slider = dom.create.elem('div',
                { id: `${app.slug}-font-size-slider-track`, class: 'fade-in-less', style: 'display: none' })
            const sliderThumb = dom.create.elem('div',
                { title: Math.floor(config.fontSize *10) /10 + 'px', id: `${app.slug}-font-size-slider-thumb` })
            const sliderTip = dom.create.elem('div', { id: `${app.slug}-font-size-slider-tip` })

            // Assemble/insert elems
            slider.append(sliderThumb, sliderTip)
            app.div.insertBefore(slider, app.div.querySelector(`.${app.slug}-tooltip,` // desktop
                                                           + '.reply-bubble')) // mobile
            // Init thumb pos
            setTimeout(() => {
                const iniLeft = (config.fontSize - config.minFontSize) / (config.maxFontSize - config.minFontSize)
                              * (slider.offsetWidth - sliderThumb.offsetWidth) // slider width
                sliderThumb.style.left = iniLeft + 'px'
            }, fontSizeSlider.fadeInDelay) // to ensure visibility for accurate dimension calcs

            // Add event listeners for dragging thumb
            let isDragging = false, startX, startLeft
            sliderThumb.addEventListener(inputEvents.down, event => {
                if (event.button != 0) return // prevent non-left-click drag
                event.preventDefault() // prevent text selection
                isDragging = true ; startX = event.clientX ; startLeft = sliderThumb.offsetLeft
                document.body.appendChild(fontSizeSlider.cursorOverlay)
            })
            document.addEventListener(inputEvents.move, event => {
                if (isDragging) moveThumb(startLeft + event.clientX - startX) })
            document.addEventListener(inputEvents.up, () => {
                isDragging = false
                if (fontSizeSlider.cursorOverlay?.isConnected) fontSizeSlider.cursorOverlay.remove()
            })

            // Add event listener for wheel-scrolling thumb
            if (!env.browser.isMobile) slider.onwheel = event => {
                event.preventDefault()
                moveThumb(sliderThumb.offsetLeft - Math.sign(event.deltaY) * fontSizeSlider.hWheelDistance)
            }

            // Add event listener for seek/dragging by inputEvents.down on track
            slider.addEventListener(inputEvents.down, event => {
                if (event.button != 0) return // prevent non-left-click drag
                event.preventDefault() // prevent text selection
                const clientX = event.clientX || event.touches?.[0]?.clientX
                moveThumb(clientX - slider.getBoundingClientRect().left - sliderThumb.offsetWidth / 2)
                isDragging = true ; startX = clientX ; startLeft = sliderThumb.offsetLeft // manually init dragging
                document.body.appendChild(fontSizeSlider.cursorOverlay)
            })

            function moveThumb(newLeft) {

                // Bound thumb
                const sliderWidth = slider.offsetWidth - sliderThumb.offsetWidth
                if (newLeft < 0) newLeft = 0
                if (newLeft > sliderWidth) newLeft = sliderWidth

                // Move thumb
                sliderThumb.style.left = newLeft + 'px'

                // Adjust font size based on thumb position
                const replyPre = app.div.querySelector('.reply-pre'),
                      fontSizePercent = newLeft / sliderWidth,
                      fontSize = config.minFontSize + fontSizePercent * (config.maxFontSize - config.minFontSize)
                replyPre.style.fontSize = fontSize + 'px'
                replyPre.style.lineHeight = fontSize * config.lineHeightRatio + 'px'
                settings.save('fontSize', fontSize)
                sliderThumb.title = Math.floor(config.fontSize *10) /10 + 'px'
            }

            return slider
        },

        toggle(state = '') { // requires app
            const slider = document.getElementById(`${app.slug}-font-size-slider-track`)
                         || fontSizeSlider.createAppend()
            const replyTip = app.div.querySelector('.reply-tip')
            const sliderTip = document.getElementById(`${app.slug}-font-size-slider-tip`)

            // Show slider
            if (state == 'on' || (!state && slider.style.display == 'none')) {

                // Position slider tip
                const btnSpan = document.getElementById(`${app.slug}-font-size-btn`),
                      rects = { appDiv: app.div.getBoundingClientRect(), btnSpan: btnSpan.getBoundingClientRect() }
                sliderTip.style.right = `${ rects.appDiv.right - ( rects.btnSpan.left + rects.btnSpan.right )/2 -35 }px`

                // Show slider, hide reply tip
                slider.style.display = sliderTip.style.display = '' ; if (replyTip) replyTip.style.display = 'none'
                setTimeout(() => slider.classList.add('active'), fontSizeSlider.fadeInDelay)

            // Hide slider
            } else if (state == 'off' || (!state && slider.style.display != 'none')) {
                slider.classList.remove('active') ; if (replyTip) replyTip.style.display = ''
                sliderTip.style.display = slider.style.display = 'none'
            }
        }
    }

    const logos = { // requires dom.js + <app|env> + GM_getResourceText()
        amazongpt: {

            create() { // requires dom.js + app
                const amazongptLogo = dom.create.elem('img', { id: `${app.slug}-logo`, class: 'no-mobile-tap-outline' })
                logos.amazongpt.update(amazongptLogo)
                return amazongptLogo
            },

            update(...targetLogos) { // requires <app|env> + GM_getResourceText()
                targetLogos = targetLogos.flat() // flatten array args nested by spread operator
                if (!targetLogos.length) targetLogos = document.querySelectorAll(`#${app.slug}-logo`)
                targetLogos.forEach(logo =>
                    logo.src = GM_getResourceText(`amzgpt${ env.ui.app.scheme == 'dark' ? 'DS' : 'LS' }logo`))
            }
        }
    }

    window.modals = {
        stack: [], // of types of undismissed modals
        class: `${app.slug}-modal`,

        about() {

            // Show modal
            const labelStyles = 'text-transform: uppercase ; font-size: 16px ; font-weight: bold ;'
                              + `color: ${ env.ui.app.scheme == 'dark' ? 'white' : '#494141' }`
            const aboutModal = modals.alert(
                `${app.symbol} ${app.msgs.appName}`, // title
                `<span style="${labelStyles}">🧠 ${app.msgs.about_author}:</span> `
                    + `<a href="${app.author[0].url}">${app.author[0].name}</a> ${app.msgs.about_and}`
                        + ` <a href="${app.urls.contributors}">${app.msgs.about_contributors}</a>\n`
                + `<span style="${labelStyles}">🏷️ ${app.msgs.about_version}:</span> `
                    + `<span class="about-em">${app.version}</span>\n`
                + `<span style="${labelStyles}">📜 ${app.msgs.about_openSourceCode}:</span> `
                    + `<a href="${app.urls.github}" target="_blank" rel="nopener">`
                        + app.urls.github + '</a>\n'
                + `<span style="${labelStyles}">🚀 ${app.msgs.about_latestChanges}:</span> `
                    + `<a href="${app.urls.github}/commits" target="_blank" rel="nopener">`
                        + `${app.urls.github}/commits</a>\n`
                + `<span style="${labelStyles}">⚡ ${app.msgs.about_poweredBy}:</span> `
                    + `<a href="${app.urls.chatgptjs}" target="_blank" rel="noopener">chatgpt.js</a>`
                        + ` v${app.chatgptjsVer}`,
                [ // buttons
                    function checkForUpdates() { userscript.updateCheck() },
                    function getSupport(){},
                    function discuss(){},
                    function moreAIextensions(){}
                ], '', 747 // modal width
            )

            // Add logo
            const aboutHeaderLogo = logos.amazongpt.create() ; aboutHeaderLogo.width = 420
            aboutHeaderLogo.style.cssText = `max-width: 98% ; margin: 15px ${
                env.browser.isMobile ? 'auto' : '15.5%' } 17px`
            aboutModal.firstChild.nextSibling.before(aboutHeaderLogo) // after close btn

            // Center text
            aboutModal.querySelector('h2').remove() // remove empty title h2
            aboutModal.querySelector('p').style.cssText = (
                'overflow-wrap: anywhere ; line-height: 1.55 ;'
              + `margin: ${ env.browser.isPhone ? '6px 0 -16px' : '0 0 0 21px' }` )

            // Hack buttons
            aboutModal.querySelectorAll('button').forEach(btn => {
                btn.style.cssText = 'height: 58px ; min-width: 136px ; text-align: center'

                // Replace link buttons w/ clones that don't dismiss modal
                if (/support|discuss|extensions/i.test(btn.textContent)) {
                    btn.replaceWith(btn = btn.cloneNode(true))
                    btn.onclick = () => modals.safeWinOpen(app.urls[
                        btn.textContent.includes(app.msgs.btnLabel_getSupport) ? 'support'
                      : btn.textContent.includes(app.msgs.btnLabel_discuss) ? 'discuss' : 'relatedExtensions' ])
                }

                // Prepend emoji + localize labels
                if (/updates/i.test(btn.textContent))
                    btn.textContent = `🚀 ${app.msgs.btnLabel_checkForUpdates}`
                else if (/support/i.test(btn.textContent))
                    btn.textContent = `🧠 ${app.msgs.btnLabel_getSupport}`
                else if (/discuss/i.test(btn.textContent))
                    btn.textContent = `🗨️ ${app.msgs.btnLabel_discuss}`
                else if (/extensions/i.test(btn.textContent))
                    btn.textContent = `🤖 ${app.msgs.btnLabel_moreAIextensions}`

                // Hide Dismiss button
                else btn.style.display = 'none'
            })

            return aboutModal
        },

        alert(title = '', msg = '', btns = '', checkbox = '', width = '') { // generic one from chatgpt.alert()
            const alertID = chatgpt.alert(title, msg, btns, checkbox, width),
                  alert = document.getElementById(alertID).firstChild
            this.init(alert) // add classes/listeners/hack bg
            return alert
        },

        api() { // requires lib/feedback.js + <apis|app|config|get|settings>

            // Show modal
            const modalBtns = [app.msgs.menuLabel_random, ...Object.keys(apis).filter(api => api != 'OpenAI')]
                .map(api => { // to btn callback/label
                    function onclick() {
                        settings.save('preferredAPI', api == app.msgs.menuLabel_random ? false : api)
                        if (modals.settings.get()) { // update status of Preferred API entry
                            const preferredAPIstatus = document.querySelector('[id*=preferredAPI] > span')
                            if (preferredAPIstatus.textContent != api) preferredAPIstatus.textContent = api
                        }
                        feedback.notify(`${app.msgs.menuLabel_preferred} API ${app.msgs.menuLabel_saved.toLowerCase()}`,
                            `${ config.anchored ? 'top' : 'bottom' }-right`)
                        if (app.div.querySelector(`.${app.slug}-alert`) && config.proxyAPIenabled)
                            get.reply({ msgs: app.msgChain, src: get.reply.src }) // re-send query if user alerted
                    }
                    Object.defineProperty(onclick, 'name', { value: api.toLowerCase() })
                    return onclick
                })
            const apiModal = modals.alert(`${app.msgs.menuLabel_preferred} API:`, '', modalBtns, '', 503)

            // Re-style elems
            apiModal.querySelector('h2').style.justifySelf = 'center' // center title
            const btnsDiv = apiModal.querySelector('.modal-buttons')
            btnsDiv.style.cssText = ` /* y-pad, gridify */
                margin: 18px 0px 14px !important ; display: grid ; grid-template-columns: repeat(3, 1fr) ; gap: 10px`
            btnsDiv.querySelectorAll('button').forEach((btn, idx) => {
                if (idx == 0) btn.style.display = 'none' // hide Dismiss button
                else btn.classList.toggle('primary-modal-btn', // emphasize preferred API
                    config.preferredAPI.toLowerCase() == btn.textContent.toLowerCase()
                        || btn.textContent == app.msgs.menuLabel_random && !config.preferredAPI)
            })

            return apiModal
        },

        handlers: {

            dismiss: { // to dismiss native modals
                click(event) {
                    const clickedElem = event.target
                    if (clickedElem == event.currentTarget || clickedElem.closest('[class*=-close-btn]'))
                        modals.hide((clickedElem.closest('[class*=-modal-bg]') || clickedElem).firstChild)
                },

                key(event) {
                    if (event.key.startsWith('Esc') || event.keyCode == 27)
                        modals.hide(document.querySelector('[class$=-modal]'))
                }
            },

            drag: {

                mousedown(event) { // find modal, update styles, attach listeners, init XY offsets
                    if (event.button != 0) return // prevent non-left-click drag
                    if (!/auto|default/.test(getComputedStyle(event.target).cursor))
                        return // prevent drag on interactive elems
                    modals.draggingModal = event.currentTarget
                    event.preventDefault() // prevent sub-elems like icons being draggable
                    Object.assign(modals.draggingModal.style, { // update styles
                        transform: 'scale(1.05)', willChange: 'transform',
                        transition: '0.1s', '-webkit-transition': '0.1s', '-moz-transition': '0.1s',
                            '-o-transition': '0.1s', '-ms-transition': '0.1s'
                    })
                    document.body.style.cursor = 'grabbing' // update cursor
                    ;[...modals.draggingModal.children] // prevent hover FX if drag lags behind cursor
                        .forEach(child => child.style.pointerEvents = 'none')
                    ;['mousemove', 'mouseup'].forEach(eventType => // add listeners
                        document.addEventListener(eventType, modals.handlers.drag[eventType]))
                    const draggingModalRect = modals.draggingModal.getBoundingClientRect()
                    modals.handlers.drag.offsetX = event.clientX - draggingModalRect.left +21
                    modals.handlers.drag.offsetY = event.clientY - draggingModalRect.top +12
                },

                mousemove(event) { // drag modal
                    if (modals.draggingModal) {
                        const newX = event.clientX - modals.handlers.drag.offsetX,
                              newY = event.clientY - modals.handlers.drag.offsetY
                        Object.assign(modals.draggingModal.style, { left: `${newX}px`, top: `${newY}px` })
                    }
                },

                mouseup() { // restore styles/pointer events, remove listeners, reset modals.draggingModal
                    Object.assign(modals.draggingModal.style, { // restore styles
                        cursor: 'inherit', transform: 'scale(1)', willChange: 'auto',
                        transition: 'inherit', '-webkit-transition': 'inherit', '-moz-transition': 'inherit',
                            '-o-transition': 'inherit', '-ms-transition': 'inherit'
                    })
                    document.body.style.cursor = '' // restore cursor
                    ;[...modals.draggingModal.children] // restore pointer events
                        .forEach(child => child.style.pointerEvents = '')
                    ;['mousemove', 'mouseup'].forEach(eventType => // remove listeners
                        document.removeEventListener(eventType, modals.handlers.drag[eventType]))
                    modals.draggingModal = null
                }
            }
        },

        hide(modal) {
            const modalContainer = modal?.parentNode ; if (!modalContainer) return
            modalContainer.style.animation = 'modal-zoom-fade-out 0.165s ease-out'
            modalContainer.onanimationend = () => modalContainer.remove()
        },

        init(modal) { // requires lib/dom.js
            if (!this.styles) this.stylize() // to init/append stylesheet

            // Add classes
            modal.classList.add('no-user-select', this.class) ; modal.parentNode.classList.add(`${this.class}-bg`)

            // Add listeners
            modal.onwheel = modal.ontouchmove = event => event.preventDefault() // disable wheel/swipe scrolling
            modal.onmousedown = this.handlers.drag.mousedown // enable click-dragging
            if (!modal.parentNode.className.includes('chatgpt-modal')) { // enable click-dismissing native modals
                const dismissElems = [modal.parentNode, modal.querySelector('[class*=-close-btn]')]
                dismissElems.forEach(elem => elem.onclick = this.handlers.dismiss.click)
            }

            // Hack BG
            dom.addRisingParticles(modal)
            setTimeout(() => { // dim bg
                modal.parentNode.style.backgroundColor = `rgba(67,70,72,${
                    env.ui.app.scheme == 'dark' ? 0.62 : 0.33 })`
                modal.parentNode.classList.add('animated')
            }, 100) // delay for transition fx
        },

        observeRemoval(modal, modalType, modalSubType) { // to maintain stack for proper nav
            const modalBG = modal.parentNode
            new MutationObserver(([mutation], obs) => {
                mutation.removedNodes.forEach(removedNode => { if (removedNode == modalBG) {
                    if (modals.stack[0].includes(modalSubType || modalType)) { // new modal not launched so nav back
                        modals.stack.shift() // remove this modal type from stack 1st
                        const prevModalType = modals.stack[0]
                        if (prevModalType) { // open it
                            modals.stack.shift() // remove type from stack since re-added on open
                            modals.open(prevModalType)
                        }
                    }
                    obs.disconnect()
                }})
            }).observe(modalBG.parentNode, { childList: true, subtree: true })
        },

        open(modalType, modalSubType) { // custom ones
            const modal = modalSubType ? modals[modalType][modalSubType]()
                        : (modals[modalType].show || modals[modalType])()
            if (!modal) return // since no div returned
            if (settings.controls[modalType]?.type != 'prompt') { // add to stack
                this.stack.unshift(modalSubType ? `${modalType}_${modalSubType}` : modalType)
                log.debug(`Modal stack: ${JSON.stringify(modals.stack)}`)
            }
            this.init(modal) // add classes/listeners/hack bg
            this.observeRemoval(modal, modalType, modalSubType) // to maintain stack for proper nav
            if (!modals.handlers.dismiss.key.added) { // add key listener to dismiss modals
                document.addEventListener('keydown', modals.handlers.dismiss.key) ; modals.handlers.dismiss.key.added = true }
        },

        replyLang() { // requires <app|config|env|log|modals|settings>
            while (true) {
                let replyLang = prompt(`${app.msgs.prompt_updateReplyLang}:`, config.replyLang)
                if (replyLang == null) break // user cancelled so do nothing
                else if (!/\d/.test(replyLang)) {
                    replyLang = ( // auto-case for menu/alert aesthetics
                        replyLang.length < 4 || replyLang.includes('-') ? replyLang.toUpperCase()
                            : log.toTitleCase(replyLang) )
                    settings.save('replyLang', replyLang || env.browser.language)
                    modals.alert(`${app.msgs.alert_langUpdated}!`, // title
                        `${app.name} ${ // msg
                           app.msgs.alert_willReplyIn} ${ replyLang || app.msgs.alert_yourSysLang }.`,
                        '', '', 375) // modal width
                    if (modals.settings.get()) // update settings menu status label
                        document.querySelector('#replyLang-settings-entry span').textContent = replyLang
                    break
                }
            }
        },

        safeWinOpen(url) { open(url, '_blank', 'noopener') }, // to prevent backdoor vulnerabilities

        scheme() {

            // Show modal
            const schemeModal = modals.alert(`${
                app.name } ${( app.msgs.menuLabel_colorScheme ).toLowerCase() }:`, '', // title
                [ function auto(){}, function light(){}, function dark(){} ] // buttons
            )

            // Center title/button cluster
            schemeModal.querySelector('h2').style.justifySelf = 'center'
            schemeModal.querySelector('.modal-buttons')
                .style.cssText = 'justify-content: center ; margin-top: -2px !important'

            // Hack buttons
            const schemeEmojis = { 'light': '☀️', 'dark': '🌘', 'auto': '🌗'}
            schemeModal.querySelectorAll('button').forEach(btn => {
                const btnScheme = btn.textContent.toLowerCase()

                // Emphasize active scheme
                btn.classList.toggle('primary-modal-btn',
                    config.scheme == btn.textContent.toLowerCase() || (btn.textContent == 'Auto' && !config.scheme))

                // Prepend emoji + localize labels
                if (Object.prototype.hasOwnProperty.call(schemeEmojis, btnScheme))
                    btn.textContent = `${schemeEmojis[btnScheme]} ${ // emoji
                        app.msgs['scheme_' + btnScheme] || app.msgs['menuLabel_' + btnScheme]
                            || btnScheme.toUpperCase() }`
                else btn.style.display = 'none' // hide Dismiss button

                // Clone button to replace listener to not dismiss modal on click
                btn.replaceWith(btn = btn.cloneNode(true))
                btn.onclick = () => {
                    const newScheme = btnScheme == 'auto' ? ui.getScheme() : btnScheme
                    settings.save('scheme', btnScheme == 'auto' ? false : newScheme)
                    schemeModal.querySelectorAll('button').forEach(btn =>
                        btn.classList.remove('primary-modal-btn')) // clear prev emphasized active scheme
                    btn.classList.add('primary-modal-btn') // emphasize newly active scheme
                    btn.style.cssText = 'pointer-events: none' // disable hover fx to show emphasis
                    setTimeout(() => { btn.style.pointerEvents = 'auto' }, // re-enable hover fx
                        100) // ...after 100ms to flicker emphasis
                    update.scheme(newScheme) ; schemeNotify(btnScheme)
                }
            })

            function schemeNotify(scheme) {

                // Show notification
                feedback.notify(`${app.msgs.menuLabel_colorScheme}: `
                      + ( scheme == 'light' ? app.msgs.scheme_light || 'Light'
                        : scheme == 'dark'  ? app.msgs.scheme_dark  || 'Dark'
                                            : app.msgs.menuLabel_auto ).toUpperCase() )
                // Append scheme icon
                const notifs = document.querySelectorAll('.chatgpt-notif'), notif = notifs[notifs.length -1]
                notif.append(icons.create({
                    key: scheme == 'light' ? 'sun' : scheme == 'dark' ? 'moon' : 'arrowsCyclic',
                    style: 'width: 23px ; height: 23px ; position: relative ; top: 3px ; margin: 3px 0 0 6px'
                }))
            }
            return schemeModal
        },

        settings: {

            createAppend() {

                // Init master elems
                const settingsContainer = dom.create.elem('div'),
                      settingsModal = dom.create.elem('div', { id: `${app.slug}-settings` })
                      settingsContainer.append(settingsModal)

                // Init settings keys
                const settingsKeys = Object.keys(settings.controls).filter(key =>
                    !(env.browser.isMobile && settings.controls[key].mobile == false))

                // Init logo
                const settingsIcon = icons.app.amazongpt.create()
                settingsIcon.style.cssText += `width: 65px ; margin-bottom: ${ env.browser.isPortrait ? -4 : 4 }px ;`
                                            + `position: relative ; top: -30px ; right: ${
                                                   env.browser.isPortrait ? -5 : 7 }px`

                // Init title
                const settingsTitleDiv = dom.create.elem('div', { id: `${app.slug}-settings-title` }),
                      settingsTitleIcon = icons.create({ key: 'sliders' }),
                      settingsTitleH4 = dom.create.elem('h4')
                settingsTitleIcon.style.cssText += 'width: 20.5px ; height: 20.5px ; margin-right: 8px ;'
                                                 + 'position: relative ; right: 2px ; top: 2.5px'
                settingsTitleH4.textContent = app.msgs.menuLabel_settings
                settingsTitleH4.prepend(settingsTitleIcon) ; settingsTitleDiv.append(settingsTitleH4)

                // Init settings lists
                const settingsLists = [], middleGap = 30 // px
                const settingsListContainer = dom.create.elem('div')
                const settingsListCnt = (
                    env.browser.isMobile && ( env.browser.isPortrait || settingsKeys.length < 8 )) ? 1 : 2
                const settingEntryCap = Math.floor(settingsKeys.length /2)
                for (let i = 0 ; i < settingsListCnt ; i++) settingsLists.push(dom.create.elem('ul'))
                settingsListContainer.style.width = '95%' // pad vs. parent
                if (settingsListCnt > 1) { // style multi-list landscape mode
                    settingsListContainer.style.cssText += ( // make/pad flexbox, add middle gap
                        `display: flex ; padding: 11px 0 13px ; gap: ${ middleGap /2 }px` )
                    settingsLists[0].style.cssText = ( // add vertical separator
                        `padding-right: ${ middleGap /2 }px` )
                }

                // Create/append setting icons/labels/toggles
                settingsKeys.forEach((key, idx) => {
                    const setting = settings.controls[key]

                    // Create/append item/label elems
                    const settingEntry = dom.create.elem('li',
                        { id: `${key}-settings-entry`, title: setting.helptip || '' })
                    const settingLabel = dom.create.elem('label') ; settingLabel.textContent = setting.label
                    settingEntry.append(settingLabel);
                    (settingsLists[env.browser.isPortrait ? 0 : +(idx >= settingEntryCap)]).append(settingEntry)

                    // Create/prepend icons
                    const settingIcon = icons.create({ key: setting.icon })
                    settingIcon.style.cssText = 'position: relative ;' + (
                        /proxy/i.test(key) ? 'top: 3px ; left: -0.5px ; margin-right: 9px'
                      : /preferred/i.test(key) ? 'top: 3.5px ; margin-right: 7.5px'
                      : /streaming/i.test(key) ? 'top: 3px ; left: 0.5px ; margin-right: 9px'
                      : /auto(?:get|focus)/i.test(key) ? 'top: 4.5px ; margin-right: 7px'
                      : /autoscroll/i.test(key) ? 'top: 3.5px ; left: -1.5px ; margin-right: 6px'
                      : /animation/i.test(key) ? 'top: 3px ; left: -1.5px ; margin-right: 6.5px'
                      : /replylang/i.test(key) ? 'top: 3px ; left: -1.5px ; margin-right: 9px'
                      : /scheme/i.test(key) ? 'top: 2.5px ; left: -1.5px ; margin-right: 8px'
                      : /debug/i.test(key) ? 'top: 3.5px ; left: -1.5px ; margin-right: 8px'
                      : /about/i.test(key) ? 'top: 3px ; left: -3px ; margin-right: 5.5px' : ''
                    )
                    settingEntry.prepend(settingIcon)
                    if (key.includes('Animation')) // customize sparkle icon elem fill
                        settingIcon[`${ key.startsWith('fg') ? 'last' : 'first' }Child`].style.fill = 'none'

                    // Create/append toggles/listeners
                    if (setting.type == 'toggle') {

                        // Init toggle input
                        const settingToggle = dom.create.elem('input', {
                            type: 'checkbox', disabled: true, style: 'display: none' })
                        settingToggle.checked = config[key] ^ key.includes('Disabled') // init based on config/name
                            && !(key == 'streamingDisabled' && !config.proxyAPIenabled) // uncheck Streaming in OAI mode

                        // Create/classify switch
                        const switchSpan = dom.create.elem('span', { class: 'track' }),
                              knobSpan = dom.create.elem('span', { class: 'knob' })

                        // Append elems
                        switchSpan.append(knobSpan) ; settingEntry.append(settingToggle, switchSpan)

                        // Update visual state w/ animation
                        setTimeout(() => modals.settings.toggle.updateStyles(settingToggle), 155)

                        // Add click listener
                        settingEntry.onclick = () => {
                            if (!(key == 'streamingDisabled' // visually switch toggle if not Streaminng...
                                && ( // ...in unsupported env...
                                    !env.scriptManager.supportsStreaming || !config.proxyAPIenabled )
                            )) modals.settings.toggle.switch(settingToggle)

                            // Call specialized toggle funcs
                            if (key.includes('proxy')) toggle.proxyMode()
                            else if (key.includes('streaming')) toggle.streaming()
                            else if (key.includes('bgAnimation')) toggle.animations('bg')
                            else if (key.includes('fgAnimation')) toggle.animations('fg')

                            // ...or generically toggle/notify
                            else {
                                settings.save(key, !config[key]) // update config
                                feedback.notify(`${settings.controls[key].label} ${
                                    menus.toolbar.state.words[+(key.includes('Disabled') ^ config[key])]}`)
                            }
                        }

                    // Add .active + config status + listeners to pop-up settings
                    } else {
                        settingEntry.classList.add('active')
                        const configStatusSpan = dom.create.elem('span', {
                            style: `float: right ; font-size: 11px ; margin-top: 3px ;${
                                key != 'about' ? 'text-transform: uppercase !important' : '' }`
                        })
                        ;({
                            about: () => {
                                const innerDiv = dom.create.elem('div'), xGap = '&emsp;&emsp;&emsp;&emsp;&emsp;'
                                modals.settings.aboutContent = {
                                    short: `v${GM_info.script.version}`,
                                    long: `${app.msgs.about_version}: <span class="about-em">v${
                                            GM_info.script.version + xGap }</span>${
                                            app.msgs.about_poweredBy} <span class="about-em">chatgpt.js</span>${xGap}`
                                }
                                for (let i = 0; i < 7; i++)
                                    modals.settings.aboutContent.long += modals.settings.aboutContent.long // make long af
                                innerDiv.innerHTML = modals.settings.aboutContent[
                                    config.fgAnimationsDisabled ? 'short' : 'long']
                                innerDiv.style.float = config.fgAnimationsDisabled ? 'right' : ''
                                configStatusSpan.append(innerDiv) ; settingEntry.onclick = () => modals.open('about')
                            },
                            preferredAPI: () => {
                                configStatusSpan.textContent = config.preferredAPI || app.msgs.menuLabel_random
                                settingEntry.onclick = () => modals.open('api')
                                settingEntry.classList.toggle('active', config.proxyAPIenabled)
                                settingEntry.style.pointerEvents = config.proxyAPIenabled ? '' : 'none'
                            },
                            replyLang: () => {
                                configStatusSpan.textContent = config.replyLang
                                settingEntry.onclick = () => modals.open('replyLang')
                            },
                            scheme: () => {
                                modals.settings.updateSchemeStatus(configStatusSpan)
                                settingEntry.onclick = () => modals.open('scheme')
                            }
                        })[key]?.()
                        settingEntry.append(configStatusSpan)
                    }
                })
                settingsListContainer.append(...settingsLists)

                // Create close button
                const closeBtn = dom.create.elem('div',
                    { title: app.msgs.tooltip_close, class: `${app.slug}-modal-close-btn no-mobile-tap-outline` })
                closeBtn.append(icons.create({ key: 'x' }))

                // Assemble/append elems
                settingsModal.append(settingsIcon, settingsTitleDiv, closeBtn, settingsListContainer)
                document.body.append(settingsContainer)

                return settingsContainer
            },

            get() { return document.getElementById(`${app.slug}-settings`) },

            show() {
                const settingsContainer = modals.settings.get()?.parentNode || modals.settings.createAppend()
                settingsContainer.style.display = '' // show modal
                if (env.browser.isMobile) { // scale 93% to viewport sides
                    const settingsModal = settingsContainer.querySelector(`#${app.slug}-settings`),
                          scaleRatio = 0.93 * innerWidth / settingsModal.offsetWidth
                    settingsModal.style.transform = `scale(${scaleRatio})`
                }
                return settingsContainer.firstChild
            },

            toggle: {
                switch(settingToggle) {
                    settingToggle.checked = !settingToggle.checked
                    modals.settings.toggle.updateStyles(settingToggle)
                },

                updateStyles(settingToggle) { // for .toggle.show() + staggered switch animations in .createAppend()
                    const settingLi = settingToggle.parentNode,
                          switchSpan = settingLi.querySelector('span'),
                          knobSpan = switchSpan.querySelector('span')
                    requestAnimationFrame(() => {
                        switchSpan.style.backgroundColor = settingToggle.checked ? '#ad68ff' : '#ccc'
                        switchSpan.style.boxShadow = settingToggle.checked ? '2px 1px 9px #d8a9ff' : 'none'
                        knobSpan.style.transform = settingToggle.checked ?
                            'translateX(14px) translateY(0)' : 'translateX(0)'
                        settingLi.classList.toggle('active', settingToggle.checked) // dim/brighten entry
                    }) // to trigger 1st transition fx
                }
            },

            updateSchemeStatus(schemeStatusSpan = null) {
                schemeStatusSpan ||= document.querySelector('#scheme-settings-entry span')
                if (schemeStatusSpan) {
                    schemeStatusSpan.textContent = ''
                    schemeStatusSpan.append( // status txt + icon
                        document.createTextNode(app.msgs[/dark|light/.test(config.scheme) ? `scheme_${config.scheme}`
                                                                                          : 'menuLabel_auto']),
                        icons.create({ size: 12,
                            key: config.scheme == 'dark' ? 'moon' : config.scheme == 'light' ? 'sun' : 'arrowsCyclic' })
                    )
                }
            }
        },

        shareChat(shareURL) {

            // Show modal
            const shareChatModal = modals.alert(
                `${log.toTitleCase(app.msgs.btnLabel_convo)} ${app.msgs.tooltip_page} ${ // title
                    app.msgs.alert_generated.toLowerCase()}!`,
                `<a target="_blank" rel="noopener" href="${shareURL}">${shareURL}</a>`, // link msg
                [ // buttons
                    function copyUrl() {
                        navigator.clipboard.writeText(shareURL)
                            .then(() => feedback.notify(app.msgs.notif_copiedToClipboard))
                    },
                    function visitPage() { modals.safeWinOpen(shareURL) },
                    function downloadChat() {
                        xhr({
                            method: 'GET', url: shareURL,
                            onload: resp => {
                                const html = resp.responseText, dlLink = dom.create.anchor(
                                    URL.createObjectURL(new Blob([html], { type: 'text/html' })))
                                dlLink.download /* filename */ = html.match(/<title>([^<]+)<\/title>/i)[1] // page title
                                    .replace(/\s*[—|/]+\s*/g, ' ') // convert symbols to space for hyphen-casing
                                    .replace(/\.{2,}/g, '') // strip ellipsis
                                    .toLowerCase().trim().replace(/\s+/g, '-') // hyphen-case
                                    + '.html'
                                document.body.append(dlLink) ; dlLink.click() ; dlLink.remove() // download HTML
                                URL.revokeObjectURL(dlLink.href) // prevent memory leaks
                            },
                            onerror: err => log.error('Failed to download chat:', err)
                        })
                    }
                ], null, 558 // modal width
            )

            // Prefix icon to title
            const modalTitle = shareChatModal.querySelector('h2'), titleIcon = icons.create({ key: 'speechBalloons' })
            titleIcon.style.cssText = 'height: 28px ; width: 28px ; position: relative ; top: 7px ; right: 8px ;'
                                    + `fill: ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' }`
            modalTitle.prepend(titleIcon)

            // Hide Dismiss button, localize other labels
            const modalBtns = shareChatModal.querySelectorAll('button')
            modalBtns[0].style.display = 'none' // hide Dismiss button
            if (!env.browser.language.startsWith('en')) // localize button labels
                modalBtns.forEach(btn => {
                    if (/copy/i.test(btn.textContent)) btn.textContent = `${app.msgs.tooltip_copy} URL`
                    else if (/visit/i.test(btn.textContent)) btn.textContent = app.msgs.btnLabel_visitPage
                    else if (/download/i.test(btn.textContent))
                         btn.textContent = `${app.msgs.btnLabel_download} ${log.toTitleCase(app.msgs.btnLabel_convo)}`
                })

            // Style elements
            shareChatModal.style.wordBreak = 'break-all' // since URL really long
            shareChatModal.querySelector('h2').style.justifySelf = 'center'
            shareChatModal.querySelector('p').style.cssText = 'text-align: center ; margin:-10px 0px 5px'
            shareChatModal.querySelector('.modal-buttons').style.cssText = 'justify-content: center'

            return shareChatModal
        },

        stylize() {
            if (!this.styles) document.head.append(this.styles = dom.create.elem('style'))
            this.styles.textContent = (

                // Vars
                `:root {
                  --modal-btn-zoom: scale(1.055) ; --modal-btn-transition: transform 0.15s ease ;
                  --settings-li-transition: transform 0.1s ease ; /* for Settings entry hover-zoom */
                  --fg-transition: opacity 0.65s cubic-bezier(0.165,0.84,0.44,1), /* fade-in */
                                     transform 0.55s cubic-bezier(0.165,0.84,0.44,1) !important ; /* move-in */
                  --bg-transition: background-color 0.25s ease !important } /* dim */`

                // Main modal styles
              + '@keyframes modal-zoom-fade-out {'
                  + '0% { opacity: 1 } 50% { opacity: 0.25 ; transform: scale(1.05) }'
                  + '100% { opacity: 0 ; transform: scale(1.35) }}'
              + '.chatgpt-modal > div {'
                  + 'padding: 20px 30px 24px 17px !important ;' // increase alert padding
                  + 'background-color: white !important ; color: black }'
              + '.chatgpt-modal p { margin: -8px 0 -14px 4px ; font-size: 22px ; line-height: 31px }'
              + `.chatgpt-modal a { color: #${ env.ui.app.scheme == 'dark' ? '00cfff' : '1e9ebb' } !important }`
              + '.modal-buttons {'
                  + `margin: 35px -5px 2px ; ${ env.browser.isMobile ? -5 : -15 }px !important ; width: 100% }`
              + '.chatgpt-modal button {' // this.alert() buttons
                  + `min-width: 121px ; padding: ${ env.browser.isMobile ? '7px' : '4px 15px' } !important ;`
                  + 'border-radius: 0 !important ; height: 39px ;'
                  + 'border: 1px solid ' + ( env.ui.app.scheme == 'dark' ? 'white' : 'black' ) + '!important ;'
                  + `${ env.ui.app.scheme == 'dark' ? 'background: none ; color: white' : '' }}`
              + '.primary-modal-btn { background: black !important ; color: white !important }'
              + '.chatgpt-modal button:hover { background-color: #9cdaff !important ; color: black !important }'
              + ( env.ui.app.scheme == 'dark' ? // darkmode chatgpt.alert() styles
                  ( '.chatgpt-modal > div, .chatgpt-modal button:not(.primary-modal-btn) {'
                      + 'color: white !important }'
                  + '.primary-modal-btn { background: hsl(186 100% 69%) !important ; color: black !important }'
                  + '.chatgpt-modal a { color: #00cfff !important }'
                  + '.chatgpt-modal button:hover {'
                      + 'background-color: #00cfff !important ; color: black !important }' ) : '' )
              + `.${modals.class} { display: grid ; place-items: center }` // for centered icon/logo
              + '[class*=modal-close-btn] {'
                  + 'position: absolute !important ; float: right ; top: 14px !important ; right: 16px !important ;'
                  + 'cursor: pointer ; width: 33px ; height: 33px ; border-radius: 20px }'
              + `[class*=modal-close-btn] path {${ env.ui.app.scheme == 'dark' ? 'stroke: white ; fill: white'
                                                                             : 'stroke: #9f9f9f ; fill: #9f9f9f' }}`
              + ( env.ui.app.scheme == 'dark' ?  // invert dark mode hover paths
                    '[class*=modal-close-btn]:hover path { stroke: black ; fill: black }' : '' )
              + '[class*=modal-close-btn]:hover { background-color: #f2f2f2 }' // hover underlay
              + '[class*=modal-close-btn] svg { margin: 11.5px }' // center SVG for hover underlay
              + '[class*=-modal] h2 {'
                  + 'font-size: 27px ; font-weight: bold ; line-height: 32px ; padding: 0 ;'
                  + 'margin: 9px 0 22px !important ;'
                  + `${ env.browser.isMobile ? 'text-align: center' // center on mobile
                                             : 'justify-self: start' }}` // left-align on desktop
              + '[class*=-modal] p { justify-self: start ; font-size: 20px }'
              + '[class*=-modal] button { font-size: 14px !important ; background: none }'
              + '[class*=-modal-bg] {'
                  + 'pointer-events: auto ;' // override any disabling from site modals
                  + 'position: fixed ; top: 0 ; left: 0 ; width: 100% ; height: 100% ;' // expand to full view-port
                  + 'display: flex ; justify-content: center ; align-items: center ; z-index: 9999 ;' // align
                  + `transition: var(--bg-transition) ; /* dim */
                        -webkit-transition: var(--bg-transition) ; -moz-transition: var(--bg-transition) ;
                        -o-transition: var(--bg-transition) ; -ms-transition: var(--bg-transition) }`
              + '[class*=-modal-bg].animated > div {'
                  + 'z-index: 13456 ; opacity: 0.98 ; transform: translateX(0) translateY(0) }'
              + '[class$=-modal] {' // native modals + chatgpt.alert()s
                  + 'position: absolute ;' // to be click-draggable
                  + 'opacity: 0 ;' // to fade-in
                  + `background-image: linear-gradient(180deg, ${
                       env.ui.app.scheme == 'dark' ? '#99a8a6 -200px, black 200px' : '#b6ebff -296px, white 171px' }) ;`
                  + `border: 1px solid ${ env.ui.app.scheme == 'dark' ? 'white' : '#b5b5b5' } !important ;`
                  + `color: ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' };`
                  + 'transform: translateX(-3px) translateY(7px) ;' // offset to move-in from
                  + `transition: var(--fg-transition) ; /* fade-in + move-in */
                        -webkit-transition: var(--fg-transition) ; -moz-transition: var(--fg-transition) ;
                        -o-transition: var(--fg-transition) ; -ms-transition:  var(--fg-transition) }
                    ${ env.browser.isMobile ? '' : `[class$=-modal] button:hover { transform: var(--modal-btn-zoom) }`}
                    ${ config.fgAnimationsDisabled ? '' : `[class$=-modal] button {
                        ${ env.browser.isMobile ? '' : 'will-change: transform ;' }
                        transition: var(--modal-btn-transition) ;
                           -webkit-transition: var(--modal-btn-transition) ;
                           -moz-transition: var(--modal-btn-transition) ;
                           -o-transition: var(--modal-btn-transition) ;
                           -ms-transition: var(--modal-btn-transition) }`}`

              // Settings modal
              + `#${app.slug}-settings {
                    min-width: ${ env.browser.isPortrait ? 288 : 755 }px ; max-width: 75vw ; margin: 12px 23px ;
                    word-wrap: break-word ; border-radius: 15px ;
                    ${ env.ui.app.scheme == 'dark' ? 'stroke: white ; fill: white' : 'stroke: black ; fill: black' };
                  --shadow: 0 30px 60px rgba(0,0,0,0.12) ;
                        box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) }`
              + `#a${app.slug}-settings-title {`
                  + 'font-weight: bold ; line-height: 19px ; text-align: center ;'
                  + `margin: 0 ${ env.browser.isMobile ? 6 : 24 }px 8px 0 }`
              + `#${app.slug}-settings-title h4 {`
                  + `font-size: ${ env.browser.isPortrait ? 26 : 31 }px ; font-weight: bold ; margin-top: -25px }`
              + `#${app.slug}-settings ul {`
                  + 'list-style: none ; padding: 0 ; margin: 0 0 2px -3px ;' // hide bullets, close bottom gap
                  + `width: ${ env.browser.isPortrait ? 100 : 50 }% }` // set width based on column cnt
              + ( env.browser.isPhone ? '' : ( `#${app.slug}-settings ul:first-of-type {` // color desktop middle separator
                  + `border-right: 1px dotted ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' }}` ))
              + `#${app.slug}-settings li {`
                  + `color: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255,0.65)' : 'rgba(0,0,0,0.45)' };`
                  + `fill: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255,0.65)' : 'rgba(0,0,0,0.45)' };`
                  + `stroke: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255,0.65)' : 'rgba(0,0,0,0.45)' };`
                  + 'height: 37px ; padding: 6px 10px 4px ; font-size: 15.5px ; list-style: none ;'
                  + `border-bottom: 1px dotted ${ env.ui.app.scheme == 'dark' ? 'white' : 'black' };` // add separators
                  + 'border-radius: 3px ;' // slightly round highlight strip
                  + `${ config.fgAnimationsDisabled || env.browser.isMobile ? '' :
                        `transition: var(--settings-li-transition) ;
                            -webkit-transition: var(--settings-li-transition) ;
                            -moz-transition: var(--settings-li-transition) ;
                            -o-transition: var(--settings-li-transition) ;
                            -ms-transition: var(--settings-li-transition)` }}`
              + `#${app.slug}-settings li.active {`
                  + `color: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255)' : 'rgba(0,0,0)' };` // for text
                  + `fill: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255)' : 'rgba(0,0,0)' };` // for icons
                  + `stroke: ${ env.ui.app.scheme == 'dark' ? 'rgb(255,255,255)' : 'rgba(0,0,0)' }}` // for icons
              + `#${app.slug}-settings li label {`
                  + 'display: contents ; padding-right: 20px ;' // right-pad labels so toggles don't hug
                  + 'font-weight: normal }' // override Amazon boldening
              + `#${app.slug}-settings li:last-of-type { border-bottom: none }` // remove last bottom-border
              + `#${app.slug}-settings li, #${app.slug}-settings li label { cursor: pointer }` // add finger on hover
              + `#${app.slug}-settings li:hover {`
                  + 'background: rgba(100,149,237,0.88) ; color: white ; fill: white ; stroke: white ;'
                  + `${ env.browser.isMobile ? '' : 'transform: scale(1.15)' }}`
              + `#${app.slug}-settings li > input { float: right } /* pos toggles */
                 #${app.slug}-settings li > .track {
                    position: relative ; left: -1px ; bottom: -5.5px ; float: right ;
                    background-color: #ccc ; width: 26px ; height: 13px ; border-radius: 28px ;
                    ${ config.fgAnimationsDisabled ? '' :
                        `transition: 0.4s ; -webkit-transition: 0.4s ; -moz-transition: 0.4s ;
                            -o-transition: 0.4s ; -ms-transition: 0.4s` }}
                 #${app.slug}-settings li .knob {
                    position: absolute ; left: 1px ; bottom: 1px ; content: "" ;
                    background-color: white ; width: 11px ; height: 11px ; border-radius: 28px ;
                    ${ config.fgAnimationsDisabled ? '' :
                        `transition: 0.2s ; -webkit-transition: 0.2s ; -moz-transition: 0.2s ;
                            -o-transition: 0.2s ; -ms-transition: 0.2s` }}`
              + '#scheme-settings-entry > span { margin: 3px -2px 0 }' // align Scheme status
              + '#scheme-settings-entry > span > svg {' // v-align/left-pad Scheme status icon
                  + 'position: relative ; top: 2px ; margin-left: 4px }'
              + ( config.fgAnimationsDisabled ? '' // spin cycle arrows icon when scheme is Auto
                  : ( '#scheme-settings-entry svg[class*=arrowsCyclic],'
                            + '.chatgpt-notif svg[class*=arrowsCyclic] { animation: rotate 5s linear infinite }' ))
              + `#about-settings-entry span { color: ${ env.ui.app.scheme == 'dark' ? '#28ee28' : 'green' }}`
              + '#about-settings-entry > span {' // outer About status span
                  + `width: ${ env.browser.isPortrait ? '15vw' : '95px' }; height: 20px ; overflow: hidden ;`
                  + `${ config.fgAnimationsDisabled ? '' : ( // fade edges
                            'mask-image: linear-gradient('
                                + 'to right, transparent, black 20%, black 89%, transparent) ;'
                  + '-webkit-mask-image: linear-gradient('
                                + 'to right, transparent, black 20%, black 89%, transparent)' )}}`
              + '#about-settings-entry > span > div {'
                  + `text-wrap: nowrap ; ${
                        config.fgAnimationsDisabled ? '' : 'animation: ticker linear 60s infinite' }}`
              + '@keyframes ticker { 0% { transform: translateX(100%) } 100% { transform: translateX(-2000%) }}'
              + `.about-em { color: ${ env.ui.app.scheme == 'dark' ? 'white' : 'green' } !important }`
            )
        },

        update: {
            width: 488,

            available() {
                log.debug(`Update v${app.latestVer} found!`)

                // Show modal
                const updateAvailModal = modals.alert(`🚀 ${app.msgs.alert_updateAvail}!`, // title
                    `${app.msgs.alert_newerVer} ${app.name} ` // msg
                        + `(v${app.latestVer}) ${app.msgs.alert_isAvail}!  `
                        + '<a target="_blank" rel="noopener" style="font-size: 1.1rem" href="'
                            + `${app.urls.github}/commits/main/greasemonkey/${app.slug}.user.js`
                        + `">${app.msgs.link_viewChanges}</a>`,
                    function update() { // button
                        modals.safeWinOpen(`${app.urls.update.gm}?t=${Date.now()}`)
                    }, '', modals.update.width
                )

                // Localize button labels if needed
                if (!env.browser.language.startsWith('en')) {
                    log.debug('Localizing button labels in non-English alert...')
                    const updateBtns = updateAvailModal.querySelectorAll('button')
                    updateBtns[1].textContent = app.msgs.btnLabel_update
                    updateBtns[0].textContent = app.msgs.btnLabel_dismiss
                }

                return updateAvailModal
            },

            unavailable() {
                log.debug('No update found.')
                return modals.alert(`${app.msgs.alert_upToDate}!`, // title
                    `${app.name} (v${app.version}) ${app.msgs.alert_isUpToDate}!`, // msg
                    '', '', modals.update.width
                )
            }
        }
    }

    // Run MAIN routine

    menus.toolbar.register()

    // Init UI props
    env.ui = { app: { scheme: config.scheme || ui.getScheme() }, site: { scheme: ui.getScheme() }}

    // Exit on specific pages
    if (document.querySelector('form[action*=Captcha]'))
        return log.debug('Exited from Captcha page')
    else if (document.querySelector('a > img[src*="/error"]'))
        return log.debug('Exited from 404 page')

    // Create/ID/classify/listenerize/stylize APP container
    app.div = dom.create.elem('div', { id: app.slug, class: 'anchored fade-in' })
    ui.addListeners.appDiv() ; if (config.expanded) app.div.classList.add('expanded')
    update.appStyle()
    ;['rpg', 'rpw'].forEach(cssType => // rising particles
        document.head.append(dom.create.style(GM_getResourceText(`${cssType}CSS`))))

    // Hide GF alert on GitHub if found
    if (location.host == 'github.com') {
        const gfAlert = [...document.querySelectorAll('.markdown-alert')]
            .find(alert => alert.textContent.includes('Greasy Fork'))
        return !gfAlert ? undefined : gfAlert.style.display = 'none'
    }

    // APPEND AMAZONGPT to Amazon
    document.body.append(app.div)
    setTimeout(() => app.div.classList.add('active'), 350) // fade in

    // Get/show FIRST REPLY
    const pageType = /\/(?:dp|product)\//.test(location.href) ? 'Product'
                   : /\/b\//.test(location.href) ? 'Category' : 'Other'
    const firstQuery = pageType == 'Other' ? 'Hi there' : prompts.create(`inform${pageType}`, { mods: 'all' })
    get.reply({ msgs: app.msgChain = [{ time: Date.now(), role: 'user', content: firstQuery }], src: 'firstQuery' })

})()
