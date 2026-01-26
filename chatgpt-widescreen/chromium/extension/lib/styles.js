// Requires components/chatbar.js + lib/dom.js + <app|env|sites>

window.styles = {

    getAllSelectors(obj, { type } = {}) { // used in this.tweaks.styles for spam selectors
        const selectors = Object.values(obj).flatMap(val =>
            typeof val == 'object' ? this.getAllSelectors(val, { type }) : val)
        return type == 'css'   ? selectors.filter(sel => !sel.startsWith('//'))
             : type == 'xpath' ? selectors.filter(sel => sel.startsWith('//'))
             : /* no type passed, all */ selectors
    },

    get outerDivSelector() { // requires env.site
        return env.site == 'chatgpt' ? 'div.text-base > div'
            : /* poe */ 'div[class*=ChatHomeMain_centered], div[class*=ChatMessagesView]'
    },

    calcWSbounds() { // requires env.site
        window.wsMinWidth ||= chatbar.nativeWidth +( env.site == 'chatgpt' ? 128 : /* poe */ 20 )
        window.wsMaxWidth ||= document.querySelector(this.outerDivSelector)?.parentNode?.offsetWidth -25
    },

    update({ key, keys, autoAppend }) { // requires lib/dom.js
        if (!key && !keys) return console.error('Option \'key\' or \'keys\' required by styles.update()')
        ;[].concat(keys || key).forEach(key => {
            const style = this[key] ; style.node ||= dom.create.style()
            if ((autoAppend ?? style.autoAppend) && !style.node.isConnected) document.head.append(style.node)
            style.node.textContent = style.css
        })
    },

    chatbar: {
        autoAppend: true,
        get css() { // requires lib/chatbar.js + <app|env>
            styles.calcWSbounds()
            const { site } = env, toWiden = app.config.widerChatbox && app.config.widescreen
            const wcbWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth )
                * Math.min(app.config.widerChatboxWidth, app.config.widescreenWidth) /100 -20
            return app.config.extensionDisabled || app.config[`${site}Disabled`] ? '' : {
                chatgpt: `main form { max-width: ${
                    toWiden ? wcbWidth : chatbar.nativeWidth }px !important ; align-self: center }`,
                poe: toWiden && `[class*=ChatHomeMain_inputContainer], [class^=ChatPageMainFooter_footerInner] {
                    width: ${wcbWidth}px }`
            }[site]
        }
    },

    fullWin: { // requires <env|sites>
        autoAppend: false,
        get css() { return sites[env.site].selectors.sidebar + '{ display: none }' }
    },

    toast: {
        autoAppend: true,
        get css() { // requires <app|env>
            return !app.config.toastMode ? '' : // flatten notifs into toast alerts
                `div.${app.slug}.chatgpt-notif {
                    position: absolute ; left: 50% ; right: 21% !important ; text-align: center ;
                    ${ env.ui.scheme == 'dark' ? 'border: 2px solid white ;' : '' }
                    margin-${ app.config.notifBottom ? 'bottom: 105px' : 'top: 42px' };
                    transform: translate(-50%, -50%) scale(0.6) !important }
                div.${app.slug}.chatgpt-notif > div.notif-close-btn {
                    top: 18px ; right: 7px ; transform: scale(2) }`
        }
    },

    tweaks: {
        autoAppend: true,
        get css() { // requires <app|env>
            const { site } = env, { [site]: { selectors }} = sites
            const tcbMinHeight = site == 'chatgpt' ? 25 : /* poe */ 50
            const tcbHeight = tcbMinHeight +(
                ( site == 'chatgpt' ? 68 : 80 ) -tcbMinHeight ) * app.config.tallerChatboxHeight /100
            return app.config.extensionDisabled || app.config[`${env.site}Disabled`] ? '' : `
                ${ app.config.tcbDisabled ? '' : `
                    ${ site == 'chatgpt' ? `div[class*=prose]:has(${selectors.input})` : selectors.input }
                        { max-height: ${tcbHeight}vh }
                    ${ site == 'chatgpt' && location.pathname == '/' ? // anchor to bottom for visible overflow
                        'div#thread-bottom-container { position: absolute ; bottom: 0 }' : '' }`
                }
                ${ !app.config.hiddenHeader ? '' : `
                    ${selectors.header} { display: none !important }
                    ${ site == 'chatgpt' // raise reply header if site header wasn't transparent to fill new gap
                        && getComputedStyle(document.querySelector(selectors.header))
                            .backgroundColor != 'rgba(0, 0, 0, 0)' ?
                                'div[class*=top-9][class*=--header-height] { top: 38px }' : '' }`
                }
                ${ !app.config.hiddenFooter ? '' : `
                    ${selectors.footer}${ site == 'chatgpt' ? `, ${selectors.btns.help}` : '' } { display: none }`}
                ${ !app.config.justifyText ? '' : `
                    ${ site == 'chatgpt' ? 'div[data-message-author-role]'
                               : /* poe */ 'div[class*=messageTextContainer]' }
                        { text-align: justify }`
                }
                ${ !app.config.ncbDisabled ? '' : '#newChat-btn { display: none }'}
                ${ app.config.btnAnimationsDisabled ? '' : ` // zoom chatbar buttons on hover
                    .${buttons.class} { will-change: transform } /* prevent wobble */
                    .${buttons.class}:hover { transform: scale(${ site == 'chatgpt' ? 1.285 : 1.15 })}`
                }
                ${ app.config.blockSpamDisabled ? '' : `
                    ${styles.getAllSelectors(selectors.spam, { type: 'css' }).join(',')} { display: none !important }
                    body { pointer-events: unset !important }` /* free click lock from blocking modals */
                }`
        }
    },

    widescreen: {
        autoAppend: false,
        get css() { // requires <app|env>
            styles.calcWSbounds()
            const { site } = env, outerDivSelector = styles.outerDivSelector
            const wsWidth = window.wsMinWidth +( window.wsMaxWidth - window.wsMinWidth )
                          * app.config.widescreenWidth /100
            return app.config.extensionDisabled || app.config[`${site}Disabled`] ? '' : {
                chatgpt: `
                    ${outerDivSelector} { max-width: ${wsWidth}px !important } /* widen outer div */
                    /* widen tables */
                        div[class*=tableContainer] { margin: 0 ; width: auto }  
                        div[class*=tableWrapper] { margin: 0 ; min-width: ${wsWidth}px }
                        div[class*=tableWrapper] > table { width: 100% }`,
                poe: `
                    ${outerDivSelector} { width: calc(${wsWidth}px - 4%) !important } /* widen outer div */
                    div[class^=Message] { max-width: 100% !important }` // widen speech bubbles
            }[site]
        }
    }
};
