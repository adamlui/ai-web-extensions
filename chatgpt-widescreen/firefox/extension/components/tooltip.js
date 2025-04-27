// Requires lib/dom.js + components/buttons.js + app + env + sites

window.tooltip = {
    import(deps) { Object.assign(this.imports ||= {}, deps) },

    getMsg(key) {
        return typeof GM_info != 'undefined' ?
            this.imports.app.msgs[key] // from tooltip.import({ app }) in userscript
                : chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
    },

    stylize() {
        document.head.append(this.styles = dom.create.style(`.${this.imports.app.slug}-tooltip {
            background-color: /* bubble style */
                rgba(0,0,0,0.71) ; padding: 5px 6px ; border-radius: 6px ; border: 1px solid #d9d9e3 ;
            font-size: 0.85rem ; color: white ; white-space: nowrap ; /* text style */
            --shadow: 4px 6px 16px 0 rgb(0 0 0 / 38%) ;
                box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            position: absolute ; bottom: 58px ; opacity: 0 ; z-index: 99999 ; /* visibility */
            transition: opacity 0.15s ; -webkit-transition: opacity 0.15s ; -moz-transition: opacity 0.15s ;
                -ms-transition: opacity 0.15s ; -o-transition: opacity 0.15s ;
            user-select: none ; webkit-user-select: none ; -moz-user-select: none ; -ms-user-select: none }`
        ))
    },

    toggle(event) {
        if (tooltip.imports.env.browser.isMobile) return
        tooltip.div = tooltip.div || dom.create.elem('div', { class: `${tooltip.imports.app.slug}-tooltip` })
        if (!tooltip.div.isConnected) event.currentTarget?.before(tooltip.div)
        if (!tooltip.styles) tooltip.stylize()
        tooltip.update(event.currentTarget)
        tooltip.div.style.opacity = +(event.type == 'mouseenter')
    },

    async update(btn) { // text & position
        if (!this.div) return // since nothing to update
        const { env: { site }, sites: { [site]: { selectors }}} = this.imports
        const btnType = btn.id.replace(/-btn$/, '')
        const rects = {
            btn: buttons[btnType]?.getBoundingClientRect(), chatbar: (await chatbar.get())?.getBoundingClientRect() }
        this.div.innerText = this.getMsg(`tooltip_${btnType}${
            !/full|wide/i.test(btnType) ? '' : (config[btnType] ? 'OFF' : 'ON')}`)
        rects.tooltipDiv = this.div.getBoundingClientRect()
        this.div.style.right = `${
            rects.chatbar.right -( rects.btn?.left + rects.btn?.right )/2 - rects.tooltipDiv.width/2
                +( site == 'chatgpt' ? -9 : site == 'perplexity' ? 19 : /* poe */ 3 )}px` // site offset
        this.div.style.bottom = ( // y-pos
            site == 'perplexity' ? (
                location.pathname != '/' ? '64px' // not homepage
                  : document.querySelector( // logged-in homepage or viewport <769px
                        selectors.btns.settings) || innerWidth < 769 ? 'revert-layer'
                                         : '51vh' // logged-out homepage
            ) : site == 'poe' ? '50px' : '42px'
        )
    }
};
