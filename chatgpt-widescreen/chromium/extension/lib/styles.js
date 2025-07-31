// Requires components/chatbar.js + lib/dom.js + <app|config|env|sites>

window.styles = {

    getAllSelectors(obj) { // used in this.tweaks.styles for spam selectors
        return Object.values(obj).flatMap(val => typeof val == 'object' ? this.getAllSelectors(val) : val) },

    get outerDivSelector() { // requires env.site
        const { site } = env
        return site == 'chatgpt' ? 'div.text-base > div'
             : site == 'perplexity' ? `div.max-w-threadWidth, .max-w-threadContentWidth, div.max-w-screen-lg,
                                       div[class*="max-w-\\[700px\\]"]` // Trending Topics on /academic
             : /* poe */ 'div[class*=ChatHomeMain_centered], div[class*=ChatMessagesView]'
    },

    initMinMaxWidths() { // requires env.site
        const { site } = env
        window.wsMinWidth = chatbar.nativeWidth +( site == 'chatgpt' ? 128 : site == 'poe' ? 66 : 274 )
        window.wsMaxWidth = document.querySelector(this.outerDivSelector)?.parentNode?.offsetWidth
    },

    async update({ key, autoAppend }) { // requires lib/dom.js
        if (!key) return console.error('Option \'key\' required by styles.update()')
        const style = this[key] ; style.node ||= dom.create.style()
        if (( autoAppend || style.autoAppend ) && !style.node.isConnected) document.head.append(style.node)
        style.node.textContent = await style.css
    },

    chatbar: {
        autoAppend: true,
        get css() { // requires <config|env>
            styles.initMinMaxWidths()
            const { site } = env, toWiden = config.widerChatbox && config.widescreen
            const wcbWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth )
                * Math.min(config.widerChatboxWidth, config.widescreenWidth) /100 -( site == 'chatgpt' ? 128 : 0 )
            return config.extensionDisabled || config[`${site}Disabled`] ? '' : {
                chatgpt: `main form { max-width: ${
                    toWiden ? wcbWidth : window.wsMinWidth -128 }px !important ; margin: auto }`,
                poe: toWiden && `[class*=ChatHomeMain_inputContainer], [class^=ChatPageMainFooter_footerInner] {
                    width: ${wcbWidth}px ; margin-right: 15px }`
            }[site]
        }
    },

    fullWin: { // requires <env|sites>
        autoAppend: false,
        get css() { return sites[env.site].selectors.sidebar + '{ display: none }' }
    },

    toast: {
        autoAppend: true,
        get css() { // requires <app|config|env>
            return !config.toastMode ? '' : // flatten notifs into toast alerts
                `div.${app.slug}.chatgpt-notif {
                    position: absolute ; left: 50% ; right: 21% !important ; text-align: center ;
                    ${ env.ui.scheme == 'dark' ? 'border: 2px solid white ;' : '' }
                    margin-${ config.notifBottom ? 'bottom: 105px' : 'top: 42px' };
                    transform: translate(-50%, -50%) scale(0.6) !important }
                div.${app.slug}.chatgpt-notif > div.notif-close-btn {
                    top: 18px ; right: 7px ; transform: scale(2) }`
        }
    },

    tweaks: {
        autoAppend: true,
        get css() { // requires <config|env>
            const { site } = env, { [site]: { selectors }} = sites
            const tcbMinHeight = site == 'chatgpt' ? 25 : site == 'perplexity' ? 40 : /* poe */ 50
            const tcbHeight = tcbMinHeight +(
                ( site == 'poe' ? 80 : 68 ) -tcbMinHeight ) * config.tallerChatboxHeight /100
            return (async () => config.extensionDisabled || config[`${env.site}Disabled`] ? '' : `
                ${ site != 'chatgpt' ? ''
                    : `main { /* prevent h-scrollbar on sync.mode('fullWindow) => delayed chatbar.tweak() */
                        overflow: clip !important }
                    ${ !await chatbar.is.dark() ? '' // color 'Attach File' white
                        : `svg:has(path[d^="M9 7C9 4.238"]) + span { color: white }`}`}
                ${ config.tcbDisabled ? '' // heighten chatbox
                    : `${ site == 'chatgpt' ? `div[class*=prose]:has(${selectors.input})` : selectors.input }
                        { max-height: ${tcbHeight}vh }
                       ${ site == 'chatgpt' && location.pathname == '/' ? // anchor to bottom for visible overflow
                            'div#thread-bottom-container { position: absolute ; bottom: 0 }' : '' }`}
                ${ !config.hiddenHeader ? ''
                    : `${selectors.header} { display: none !important }
                       ${ site == 'chatgpt' ? 'div[class*=--header-height] { padding-top: 56px }' : '' }`}
                ${ !config.hiddenFooter ? ''
                    : `${selectors.footer}${ site != 'poe' ? `, ${selectors.btns.help}` : '' }
                        { display: none }`}
                ${ !config.ncbDisabled ? '' : `#newChat-btn { display: none } ${
                    site == 'perplexity' ? '#widescreen-btn { margin-left: 18px }' : '' }`}
                ${ config.btnAnimationsDisabled ? '' : // zoom chatbar buttons on hover
                   `.${buttons.class} { will-change: transform } /* prevent wobble */
                    .${buttons.class}:hover { transform: scale(${ site == 'poe' ? 1.15 : 1.285 })}`}
                ${ site == 'perplexity' ? // prevent overlay
                    `.${buttons.class} { background: none !important }` : '' }
                ${ config.blockSpamDisabled ? ''
                    : `${styles.getAllSelectors(selectors.spam).join(',')} { display: none !important }
                        body { pointer-events: unset !important }` /* free click lock from blocking modals */ }`
            )()
        }
    },

    widescreen: {
        autoAppend: false,
        get css() { // requires <config|env>
            styles.initMinMaxWidths()
            const { site } = env, outerDivSelector = styles.outerDivSelector
            const wsWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth ) * config.widescreenWidth /100
            return config.extensionDisabled || config[`${site}Disabled`] ? '' : {
                chatgpt: `
                    ${outerDivSelector} { max-width: ${wsWidth}px !important } /* widen outer div */
                    div[class*=tableContainer] { min-width: 100vw }  /* widen tables */
                    div[class*=tableWrapper] { min-width: ${wsWidth}px }
                    div[class*=tableWrapper] > table { width: 100% }`,
                perplexity: `
                    ${outerDivSelector} { max-width: ${wsWidth}px }
                    ${ location.pathname.startsWith('/collections') ? '' // widen inner-left div
                        : '@media (min-width: 769px) { .col-span-8 { width: 151% }}' }
                    ${ !location.pathname.startsWith('/travel') ? '' // push right
                        : `${outerDivSelector} { margin-left: 68px }` }
                    .col-span-4:has([class*=sticky]) { display: none }`, // hide right-bar
                poe: `
                    ${outerDivSelector} { width: calc(${wsWidth}px - 4%) !important } /* widen outer div */
                    div[class^=Message] { max-width: 100% !important }` // widen speech bubbles
            }[site]
        }
    }
};
