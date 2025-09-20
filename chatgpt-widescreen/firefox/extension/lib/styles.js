// Requires components/chatbar.js + lib/dom.js + <app|config|env|sites>

window.styles = {

    getAllSelectors(obj) { // used in this.tweaks.styles for spam selectors
        return Object.values(obj).flatMap(val => typeof val == 'object' ? this.getAllSelectors(val) : val) },

    get outerDivSelector() { // requires env.site
        const { site } = env
        return site == 'chatgpt' ? 'div.text-base > div'
            : /* poe */ 'div[class*=ChatHomeMain_centered], div[class*=ChatMessagesView]'
    },

    calcWSbounds() { // requires env.site
        const { site } = env
        window.wsMinWidth ||= chatbar.nativeWidth +( site == 'chatgpt' ? 128 : /* poe */ 66 )
        window.wsMaxWidth ||= document.querySelector(this.outerDivSelector)?.parentNode?.offsetWidth -25
    },

    async update({ key, keys, autoAppend }) { // requires lib/dom.js
        if (!key && !keys) return console.error('Option \'key\' or \'keys\' required by styles.update()')
        ;(Array.isArray(keys) ? keys : [key]).forEach(async key => {
            const style = this[key] ; style.node ||= dom.create.style()
            if ((autoAppend ?? style.autoAppend) && !style.node.isConnected) document.head.append(style.node)
            style.node.textContent = await style.css
        })
    },

    chatbar: {
        autoAppend: true,
        get css() { // requires lib/chatbar.js + <config|env>
            styles.calcWSbounds()
            const { site } = env, toWiden = config.widerChatbox && config.widescreen
            const wcbWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth )
                * Math.min(config.widerChatboxWidth, config.widescreenWidth) /100 -20
            return config.extensionDisabled || config[`${site}Disabled`] ? '' : {
                chatgpt: `main form { max-width: ${
                    toWiden ? wcbWidth : chatbar.nativeWidth }px !important ; align-self: center }`,
                poe: `[class*=ChatHomeMain_inputContainer], [class^=ChatPageMainFooter_footerInner] { width: ${
                    toWiden ? wcbWidth : chatbar.nativeWidth }px !important ; margin-right: 15px }`
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
            const tcbMinHeight = site == 'chatgpt' ? 25 : /* poe */ 50
            const tcbHeight = tcbMinHeight +(
                ( site == 'chatgpt' ? 68 : 80 ) -tcbMinHeight ) * config.tallerChatboxHeight /100
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
                       ${ site == 'chatgpt' ? 'div[class*=--header-height] { padding-top: 52px }' : '' }`}
                ${ !config.hiddenFooter ? ''
                    : `${selectors.footer}${ site == 'chatgpt' ? `, ${selectors.btns.help}` : '' }
                        { display: none }`}
                ${ !config.justifyText ? ''
                    : `${ site == 'chatgpt' ? 'div[data-message-author-role]'
                                : /* poe */ 'div[class*=messageTextContainer]' }
                        { text-align: justify }` }
                ${ !config.ncbDisabled ? '' : '#newChat-btn { display: none }' }
                ${ config.btnAnimationsDisabled ? '' : // zoom chatbar buttons on hover
                   `.${buttons.class} { will-change: transform } /* prevent wobble */
                    .${buttons.class}:hover { transform: scale(${ site == 'chatgpt' ? 1.285 : 1.15 })}`}
                ${ config.blockSpamDisabled ? ''
                    : `${styles.getAllSelectors(selectors.spam).join(',')} { display: none !important }
                        body { pointer-events: unset !important }` /* free click lock from blocking modals */ }`
            )()
        }
    },

    widescreen: {
        autoAppend: false,
        get css() { // requires <config|env>
            styles.calcWSbounds()
            const { site } = env, outerDivSelector = styles.outerDivSelector
            const wsWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth ) * config.widescreenWidth /100
            return config.extensionDisabled || config[`${site}Disabled`] ? '' : {
                chatgpt: `
                    ${outerDivSelector} { max-width: ${wsWidth}px !important } /* widen outer div */
                    div[class*=tableContainer] { min-width: 100vw }  /* widen tables */
                    div[class*=tableWrapper] { min-width: ${wsWidth}px }
                    div[class*=tableWrapper] > table { width: 100% }`,
                poe: `
                    ${outerDivSelector} { width: calc(${wsWidth}px - 4%) !important } /* widen outer div */
                    div[class^=Message] { max-width: 100% !important }` // widen speech bubbles
            }[site]
        }
    }
};
