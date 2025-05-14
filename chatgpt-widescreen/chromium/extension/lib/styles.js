// Requires components/chatbar.js + lib/dom.js + env.site + sites

window.styles = {

    getAllSelectors(obj) { // used in this.tweaks.update() for spam selectors
        return Object.values(obj).flatMap(val => typeof val == 'object' ? this.getAllSelectors(val) : val) },

    chatbar: {
        update() { // auto-appends to <head>
            if (!this.node?.isConnected) document.head.append(this.node ||= dom.create.style())
            this.node.textContent = ({
                chatgpt: !config.widerChatbox &&
                    `main form { max-width: ${chatbar.nativeWidth}px !important ; margin: auto }`,
                poe: config.widerChatbox && config.widescreen &&
                    '[class^=ChatPageMainFooter_footerInner] { width: 98% ; margin-right: 15px }'
            })[env.site]
        }
    },

    fullWin: {
        update() {
            (this.node ||= dom.create.style()).textContent = sites[env.site].selectors.sidebar + '{ display: none }' }
    },

    toast: {
        update() { // auto-appends to <head>
            if (!this.node?.isConnected) document.head.append(this.node ||= dom.create.style())
            this.node.textContent = !config.toastMode ? '' : // flatten notifs into toast alerts
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
        update() { // auto-appends to <head>
            const { site } = env, { [site]: { selectors }} = sites;
            if (!this.node?.isConnected) document.head.append(this.node ||= dom.create.style())
            this.node.textContent = `
                ${ site == 'chatgpt' ?
                    `main { /* prevent h-scrollbar on sync.mode('fullWindow) => delayed chatbar.tweak() */
                        overflow: clip !important }` : '' }
                ${ config.tcbDisabled ? '' // heighten chatbox
                    : `${ site == 'chatgpt' ? `div[class*=prose]:has(${selectors.input})` : selectors.input }
                        { max-height: 68vh }` }
                ${ !config.hiddenHeader ? ''
                    : `${selectors.header} { display: none !important }
                       ${ site == 'chatgpt' ? 'main { padding-top: 12px }' : '' }` }
                ${ !config.hiddenFooter ? ''
                    : `${selectors.footer}${ site != 'poe' ? `, ${selectors.btns.help}` : '' }
                        { display: none }` }
                #newChat-btn { display: ${ config.ncbDisabled ? 'none' : 'flex' }}
                ${ config.btnAnimationsDisabled ? '' : // zoom chatbar buttons on hover
                   `.${buttons.class} { will-change: transform } /* prevent wobble */
                    .${buttons.class}:hover { transform: scale(${ site == 'poe' ? 1.15 : 1.285 }) }` }
                ${ site == 'perplexity' ? // prevent overlay
                    `.${buttons.class} { background: none !important }` : '' }
                ${ config.blockSpamDisabled ? ''
                    : `${styles.getAllSelectors(selectors.spam).join(',')} { display: none !important }
                        body { pointer-events: unset !important }` /* free click lock from blocking modals */ }`
        }
    },

    widescreen: {
        update() {
            (this.node ||= dom.create.style()).textContent = ({
                chatgpt: `
                    .text-base { max-width: 100% !important } /* widen outer container */
                    .tableContainer { min-width: 100% }`, // widen tables
                perplexity: `
                    .max-w-threadWidth, .max-w-threadContentWidth { /* widen limiting Page/Answer containers */
                        max-width: 100% }
                    @media (min-width: 769px) { .col-span-8 { width: 151% }} /* widen inner-left container */
                    .col-span-4:has([class*=sticky]) { display: none }`, // hide right-bar
                poe: `
                    [class*=ChatMessagesView] { width: 100% !important } /* widen outer container */
                    [class^=Message] { max-width: 100% !important }` // widen speech bubbles
            })[env.site]
        }
    }
};
