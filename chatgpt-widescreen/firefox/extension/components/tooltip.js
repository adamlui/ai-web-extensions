// Requires lib/dom.js + components/buttons.js + env + msgs: app.msgs (Greasemonkey only) + sites

window.tooltip = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    getMsg(key) {
        return typeof GM_info != 'undefined' ?
            this.imports.msgs[key] // from tooltip.import({ msgs: app.msgs }) in userscript
                : chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
    },

    stylize() {
        if (this.styles) return
        this.styles = dom.create.style(`.cwm-tooltip {
            background-color: /* bubble style */
                rgba(0,0,0,0.71) ; padding: 5px 6px ; border-radius: 6px ; border: 1px solid #d9d9e3 ;
            font-size: 0.85rem ; color: white ; white-space: nowrap ; /* text style */
            --shadow: 4px 6px 16px 0 rgb(0 0 0 / 38%) ;
                box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            position: absolute ; bottom: 58px ; opacity: 0 ; z-index: 99999 ; /* visibility */
            transition: opacity 0.15s ; -webkit-transition: opacity 0.15s ; -moz-transition: opacity 0.15s ;
                -ms-transition: opacity 0.15s ; -o-transition: opacity 0.15s ;
            user-select: none ; webkit-user-select: none ; -moz-user-select: none ; -ms-user-select: none }`
        )
        document.head.append(this.styles)
    },

    toggle(event) {
        if (!tooltip.div) tooltip.div = dom.create.elem('div', { class: 'cwm-tooltip' })
        if (!tooltip.div.isConnected) event.currentTarget?.before(tooltip.div)
        if (!tooltip.styles) tooltip.stylize()
        tooltip.update(event.currentTarget.id.replace(/-btn$/, ''))
        tooltip.div.style.opacity = +(event.type == 'mouseenter')
    },

    async update(btnType) { // text & position
        if (!this.div) return // since nothing to update
        const site = this.imports.env.site
        const rects = {
            btn: buttons[btnType]?.getBoundingClientRect(), chatbar: (await chatbar.get())?.getBoundingClientRect() }
        this.div.innerText = this.getMsg(`tooltip_${btnType}${
            !/full|wide/i.test(btnType) ? '' : (config[btnType] ? 'OFF' : 'ON')}`)
        rects.tooltipDiv = this.div.getBoundingClientRect()
        this.div.style.right = `${
            rects.chatbar.right -( rects.btn?.left + rects.btn?.right )/2 - rects.tooltipDiv.width/2
                +( site == 'perplexity' && location.pathname.startsWith('/search/') ?
                    ( innerWidth - rects.chatbar.right -28 ) : 0 )
                +( site == 'chatgpt' ? -9 : site == 'perplexity' ? 15 : /* poe */ 3 )}px` // site offset
        this.div.style.bottom = ( // y-pos
            site == 'perplexity' ? (
                location.pathname != '/' ? '64px' // not homepage
                  : document.querySelector( // logged-in homepage
                        this.imports.sites.perplexity.selectors.btns.settings) ? 'revert-layer'
                                         : '51vh' // logged-out homepage
            ) : site == 'poe' ? '50px' : '42px'
        )
    }
};
